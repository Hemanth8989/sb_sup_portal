import { api } from '../client'
import type { PagedResult, ProductInventoryDto, ProductVariantInventoryDto } from '../../types/api'

const BASE = '/api/v1/supplier/products'

export const productsApi = {
  list: (params: {
    categoryCode?: string
    search?: string
    status?: string
    page?: number
    perPage?: number
  } = {}) =>
    api.get<PagedResult<ProductInventoryDto>>(BASE, { params }),

  get: (id: string) =>
    api.get<ProductInventoryDto>(`${BASE}/${id}`),

  upsert: (body: {
    productId?: string
    categoryCode: string
    name: string
    brand?: string
    description?: string
    variantId?: string
    sku: string
    variantName: string
    unitOfMeasure: string
    basePrice: number
    qtyAvailable: number
    leadTimeDays?: number
  }) =>
    api.post<ProductInventoryDto>(BASE, body),

  adjustStock: (variantId: string, body: { delta: number; newPrice?: number; reason?: string }) =>
    api.patch<ProductVariantInventoryDto>(`${BASE}/${variantId}/stock`, body),

  deactivate: (id: string) =>
    api.delete<void>(`${BASE}/${id}`),
}
