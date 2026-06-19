import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../api/supplier/products'
import type { ProductInventoryFilterParams } from '../types/api'

const keys = {
  all:    ['products']                                    as const,
  list:   (p: object) => ['products', 'list', p]          as const,
  detail: (id: string) => ['products', 'detail', id]       as const,
}

export function useProductInventory(params: ProductInventoryFilterParams = {}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn:  () => productsApi.list(params),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn:  () => productsApi.get(id),
    enabled:  !!id,
  })
}

export function useUpsertProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productsApi.upsert,
    onSuccess:  () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useAdjustStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ variantId, body }: {
      variantId: string
      body: { delta: number; newPrice?: number; reason?: string }
    }) => productsApi.adjustStock(variantId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useDeactivateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productsApi.deactivate,
    onSuccess:  () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}
