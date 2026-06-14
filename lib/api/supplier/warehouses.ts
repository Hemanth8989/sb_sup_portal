import { api } from '@/lib/api/client'
import type { WarehouseDto } from '@/lib/types/api'

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

export const warehousesApi = {
  list:        ()                              => api.get<WarehouseDto[]>(BASE),
  get:         (id: string)                   => api.get<WarehouseDto>(`${BASE}/${id}`),
  create:      (body: CreateWarehouseBody)    => api.post<WarehouseDto>(BASE, body),
  update:      (id: string, body: UpdateWarehouseBody) => api.put<WarehouseDto>(`${BASE}/${id}`, body),
  setPrimary:  (id: string)                   => api.patch<void>(`${BASE}/${id}/set-primary`, {}),
  deactivate:  (id: string)                   => api.delete<void>(`${BASE}/${id}`),
  transferSlabs: (id: string, body: TransferSlabsBody) =>
    api.post<{ transferredCount: number }>(`${BASE}/${id}/transfer-slabs`, body),
}
