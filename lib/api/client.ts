import type { ApiError } from '@/lib/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
const DEV_AUTH  = process.env.NEXT_PUBLIC_DEV_AUTH === 'true'

/**
 * How tenant identity reaches the API:
 *
 * PRODUCTION — Clerk issues a JWT that includes custom claims:
 *   { tenant_id, tenant_type, role }
 *   The frontend sends it as `Authorization: Bearer <token>`.
 *   The API's CurrentTenantService reads these claims.
 *
 * DEVELOPMENT (NEXT_PUBLIC_DEV_AUTH=true) — no Clerk needed.
 *   The API's DevAuthMiddleware (DevAuth:Enabled=true in appsettings.Development.json)
 *   injects a fake ClaimsPrincipal for the configured seed tenant, so the API
 *   treats every request as coming from that tenant.
 *   The frontend sends a static sentinel token ("dev") which the API ignores
 *   because DevAuthMiddleware runs before UseAuthentication.
 */
type GetTokenFn = () => Promise<string | null>

let getToken: GetTokenFn = async () => (DEV_AUTH ? 'dev' : null)

export function setTokenProvider(fn: GetTokenFn) {
  // In dev-auth mode the provider is ignored — token is always the sentinel.
  if (!DEV_AUTH) {
    getToken = fn
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (!res.ok) {
    let err: ApiError
    try {
      err = await res.json()
    } catch {
      err = { status: res.status, title: res.statusText }
    }
    throw err
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string)                => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)               => request<T>(path, { method: 'DELETE' }),
}
