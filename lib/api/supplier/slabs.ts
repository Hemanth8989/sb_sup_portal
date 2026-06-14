import { api } from '@/lib/api/client'
import type { PagedResult, SupplierSlabDto, SupplierSlabFilterParams, InventorySummary } from '@/lib/types/api'

function buildQuery(params: SupplierSlabFilterParams): string {
  const q = new URLSearchParams()

  if (params.searchQuery)                  q.set('searchQuery', params.searchQuery)
  if (params.statuses?.length)             params.statuses.forEach(s => q.append('statuses', s))
  if (params.materialTypes?.length)        params.materialTypes.forEach(m => q.append('materialTypes', m))
  if (params.colorFamilies?.length)        params.colorFamilies.forEach(c => q.append('colorFamilies', c))
  if (params.finishes?.length)             params.finishes.forEach(f => q.append('finishes', f))
  if (params.thicknessMin != null)         q.set('thicknessMin', String(params.thicknessMin))
  if (params.thicknessMax != null)         q.set('thicknessMax', String(params.thicknessMax))
  if (params.minNetSqft != null)           q.set('minNetSqft', String(params.minNetSqft))
  if (params.isRemnant != null)            q.set('isRemnant', String(params.isRemnant))
  if (params.warehouseId)                  q.set('warehouseId', params.warehouseId)
  if (params.sortBy)                       q.set('sortBy', params.sortBy)
  if (params.sortDir)                      q.set('sortDir', params.sortDir)
  if (params.page)                         q.set('page', String(params.page))
  if (params.perPage)                      q.set('perPage', String(params.perPage))

  const str = q.toString()
  return str ? `?${str}` : ''
}

export async function getSupplierSlabs(
  params: SupplierSlabFilterParams = {},
): Promise<PagedResult<SupplierSlabDto>> {
  return api.get(`/api/v1/supplier/slabs${buildQuery(params)}`)
}

export async function getInventorySummary(): Promise<InventorySummary> {
  return api.get('/api/v1/supplier/analytics/summary')
}

export async function updateSlabStatus(slabId: string, status: string): Promise<void> {
  return api.patch(`/api/v1/supplier/slabs/${slabId}/status`, { status })
}

export async function deleteSlab(slabId: string): Promise<void> {
  return api.delete(`/api/v1/supplier/slabs/${slabId}`)
}
