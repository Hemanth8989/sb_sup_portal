import { api } from '../client'
import type { ConnectionDto } from '../../types/api'

const BASE = '/api/v1/supplier/connections'

export const connectionsApi = {
  list: (params: { status?: string } = {}) =>
    api.get<ConnectionDto[]>(BASE, { params }),

  get: (id: string) =>
    api.get<ConnectionDto>(`${BASE}/${id}`),

  respond: (id: string, body: { action: string; reason?: string }) =>
    api.post<ConnectionDto>(`${BASE}/${id}/respond`, body),

  updateTier: (id: string, pricingTier: string) =>
    api.patch<ConnectionDto>(`${BASE}/${id}/tier`, { pricingTier }),

  assignPriceList: (id: string, priceListId: string | null) =>
    api.patch<void>(`${BASE}/${id}/price-list`, { priceListId }),

  updateNotes: (id: string, notes: string | null) =>
    api.patch<ConnectionDto>(`${BASE}/${id}/notes`, { fabricatorNotes: notes }),
}
