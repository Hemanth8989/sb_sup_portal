import { api } from '@/lib/api/client'
import type { PagedResult, SupplierSlabDto, SupplierSlabFilterParams, InventorySummary } from '@/lib/types/api'

function buildQuery(params: SupplierSlabFilterParams): string {
  const q = new URLSearchParams()
  if (params.searchQuery)           q.set('searchQuery', params.searchQuery)
  if (params.statuses?.length)      params.statuses.forEach(s => q.append('statuses', s))
  if (params.materialTypes?.length) params.materialTypes.forEach(m => q.append('materialTypes', m))
  if (params.colorFamilies?.length) params.colorFamilies.forEach(c => q.append('colorFamilies', c))
  if (params.finishes?.length)      params.finishes.forEach(f => q.append('finishes', f))
  if (params.thicknessMin != null)  q.set('thicknessMin', String(params.thicknessMin))
  if (params.thicknessMax != null)  q.set('thicknessMax', String(params.thicknessMax))
  if (params.minNetSqft != null)    q.set('minNetSqft', String(params.minNetSqft))
  if (params.isRemnant != null)     q.set('isRemnant', String(params.isRemnant))
  if (params.warehouseId)           q.set('warehouseId', params.warehouseId)
  if (params.sortBy)                q.set('sortBy', params.sortBy)
  if (params.sortDir)               q.set('sortDir', params.sortDir)
  if (params.page)                  q.set('page', String(params.page))
  if (params.perPage)               q.set('perPage', String(params.perPage))
  const str = q.toString()
  return str ? `?${str}` : ''
}

export async function getSupplierSlabs(params: SupplierSlabFilterParams = {}): Promise<PagedResult<SupplierSlabDto>> {
  return api.get(`/api/v1/supplier/slabs${buildQuery(params)}`)
}

export async function getSlab(slabId: string): Promise<SupplierSlabDto> {
  return api.get(`/api/v1/supplier/slabs/${slabId}`)
}

export async function getInventorySummary(): Promise<InventorySummary> {
  return api.get('/api/v1/supplier/analytics/summary')
}

export async function createSlab(body: CreateSlabBody): Promise<SupplierSlabDto> {
  return api.post('/api/v1/supplier/slabs', body)
}

export async function updateSlab(slabId: string, body: UpdateSlabBody): Promise<SupplierSlabDto> {
  return api.put(`/api/v1/supplier/slabs/${slabId}`, body)
}

export async function updateSlabStatus(slabId: string, status: string): Promise<SupplierSlabDto> {
  return api.patch(`/api/v1/supplier/slabs/${slabId}/status`, { status })
}

export async function setSlabPrice(slabId: string, priceOverride: number | null): Promise<SupplierSlabDto> {
  return api.patch(`/api/v1/supplier/slabs/${slabId}/price`, { priceOverride })
}

export async function bulkUpdateSlabStatus(slabIds: string[], status: string): Promise<{ updated: number }> {
  return api.post('/api/v1/supplier/slabs/bulk-status', { slabIds, status })
}

export async function deleteSlab(slabId: string): Promise<void> {
  return api.delete(`/api/v1/supplier/slabs/${slabId}`)
}

export interface CreateSlabBody {
  variantId: string
  internalRef: string
  materialType: string
  materialName: string
  finish: string
  thicknessCm: number
  grossLengthMm: number
  grossWidthMm: number
  qualityGrade?: string
  colorFamily?: string
  pattern?: string
  originCountry?: string
  quarryName?: string
  lotNumber?: string
  blockNumber?: string
  barcode?: string
  weightKg?: number
  bundleId?: string
  warehouseId?: string
  rackLocation?: string
  priceOverride?: number
  isRemnant?: boolean
  notes?: string
}

export type UpdateSlabBody = Omit<CreateSlabBody, 'variantId'>
