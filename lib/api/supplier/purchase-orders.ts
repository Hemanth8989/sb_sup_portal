import { api } from '../client'
import type { PagedResult, PurchaseOrderDto } from '../../types/api'

const BASE = '/api/v1/supplier/purchase-orders'

export const purchaseOrdersApi = {
  list: (params: { status?: string; search?: string; page?: number; perPage?: number } = {}) =>
    api.get<PagedResult<PurchaseOrderDto>>(BASE, { params }),

  get: (id: string) =>
    api.get<PurchaseOrderDto>(`${BASE}/${id}`),

  acknowledge: (id: string, body: { supplierNotes?: string; confirmedDelivery?: string }) =>
    api.post<PurchaseOrderDto>(`${BASE}/${id}/acknowledge`, body),

  ship: (id: string, body: { trackingNumber: string; carrier?: string; confirmedDelivery?: string }) =>
    api.post<PurchaseOrderDto>(`${BASE}/${id}/ship`, body),

  cancel: (id: string, reason?: string) =>
    api.post<PurchaseOrderDto>(`${BASE}/${id}/cancel`, { reason }),

  updateNotes: (id: string, supplierNotes: string | null) =>
    api.patch<PurchaseOrderDto>(`${BASE}/${id}/notes`, { supplierNotes }),

  updateStatus: (id: string, body: { status: string; note?: string; supplierNotes?: string }) =>
    api.patch<PurchaseOrderDto>(`${BASE}/${id}/status`, body),
}
