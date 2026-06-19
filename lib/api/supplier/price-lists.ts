import { api } from '../client'
import type { PriceListDetailDto, PriceListDto, PriceListItemDto } from '../../types/api'

const BASE = '/api/v1/supplier/price-lists'

export const priceListsApi = {
  list: () =>
    api.get<PriceListDto[]>(BASE),

  get: (id: string) =>
    api.get<PriceListDetailDto>(`${BASE}/${id}`),

  create: (body: { name: string; description?: string; tier: string; currency: string }) =>
    api.post<PriceListDto>(BASE, body),

  update: (id: string, body: { name: string; description?: string; tier: string; currency: string; isActive: boolean }) =>
    api.put<PriceListDto>(`${BASE}/${id}`, body),

  delete: (id: string) =>
    api.delete<void>(`${BASE}/${id}`),

  upsertItem: (id: string, body: { variantId: string; unitPrice: number }) =>
    api.put<PriceListItemDto>(`${BASE}/${id}/items`, body),

  removeItem: (id: string, itemId: string) =>
    api.delete<void>(`${BASE}/${id}/items/${itemId}`),
}
