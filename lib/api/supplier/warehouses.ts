import { api } from '@/lib/api/client'
import type { WarehouseDto, WarehouseProductStockDto, StockMovementDto } from '@/lib/types/api'

const BASE = '/api/v1/supplier/warehouses'

export interface CreateWarehouseBody {
  name: string
  addressLine1?: string
  city?: string
  stateProvince?: string
  postalCode?: string
  country?: string
  phone?: string
  setAsPrimary: boolean
}

export interface UpdateWarehouseBody {
  name: string
  addressLine1?: string
  city?: string
  stateProvince?: string
  postalCode?: string
  country?: string
  phone?: string
}

export interface TransferSlabsBody {
  slabIds: string[]
  targetWarehouseId: string
  rackLocation?: string
}

export interface WarehouseProductStockParams {
  search?: string
  categoryCode?: string
  lowStockOnly?: boolean
  page?: number
  perPage?: number
}

export interface ReceiveStockBody {
  variantId: string
  qty: number
  rackLocation?: string
  notes?: string
}

export interface TransferWarehouseStockBody {
  variantId: string
  toWarehouseId: string
  qty: number
  toRackLocation?: string
  notes?: string
}

export interface AdjustWarehouseStockBody {
  variantId: string
  newQtyOnHand: number
  reason: string
  notes?: string
}

export interface SetReorderPointBody {
  variantId: string
  reorderPoint: number | null
  reorderQty: number | null
}

export const warehousesApi = {
  list:        ()                              => api.get<WarehouseDto[]>(BASE),
  get:         (id: string)                   => api.get<WarehouseDto>(`${BASE}/${id}`),
  create:      (body: CreateWarehouseBody)    => api.post<WarehouseDto>(BASE, body),
  update:      (id: string, body: UpdateWarehouseBody) => api.put<WarehouseDto>(`${BASE}/${id}`, body),
  setPrimary:  (id: string)                   => api.patch<void>(`${BASE}/${id}/set-primary`, {}),
  deactivate:  (id: string)                   => api.delete<void>(`${BASE}/${id}`),
  transferSlabs: (id: string, body: TransferSlabsBody) =>
    api.post<{ transferredCount: number }>(`${BASE}/${id}/transfer-slabs`, body),

  // Product stock
  getProducts: (id: string, params?: WarehouseProductStockParams) => {
    const qs = new URLSearchParams()
    if (params?.search)        qs.set('search',        params.search)
    if (params?.categoryCode)  qs.set('categoryCode',  params.categoryCode)
    if (params?.lowStockOnly)  qs.set('lowStockOnly',  'true')
    if (params?.page)          qs.set('page',          String(params.page))
    if (params?.perPage)       qs.set('perPage',       String(params.perPage))
    const q = qs.toString()
    return api.get<{ items: WarehouseProductStockDto[]; totalCount: number }>(
      `${BASE}/${id}/products${q ? `?${q}` : ''}`
    )
  },
  receiveStock:   (id: string, body: ReceiveStockBody) =>
    api.post<WarehouseProductStockDto>(`${BASE}/${id}/products/receive`, body),
  transferStock:  (id: string, body: TransferWarehouseStockBody) =>
    api.post<{ fromWarehouseQty: number; toWarehouseQty: number }>(`${BASE}/${id}/products/transfer`, body),
  adjustStock:    (id: string, body: AdjustWarehouseStockBody) =>
    api.patch<WarehouseProductStockDto>(`${BASE}/${id}/products/adjust`, body),
  setReorderPoint: (id: string, body: SetReorderPointBody) =>
    api.patch<void>(`${BASE}/${id}/products/reorder`, body),
  getStockMovements: (id: string, limit = 100) =>
    api.get<StockMovementDto[]>(`${BASE}/${id}/stock-movements?limit=${limit}`),
}
