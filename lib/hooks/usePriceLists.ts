import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { priceListsApi } from '../api/supplier/price-lists'

const keys = {
  all:    ['price-lists']                              as const,
  detail: (id: string) => ['price-lists', id]           as const,
}

export function usePriceLists() {
  return useQuery({
    queryKey: keys.all,
    queryFn:  priceListsApi.list,
  })
}

export function usePriceList(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn:  () => priceListsApi.get(id),
    enabled:  !!id,
  })
}

export function useCreatePriceList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: priceListsApi.create,
    onSuccess:  () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useUpdatePriceList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof priceListsApi.update>[1] }) =>
      priceListsApi.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) })
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useDeletePriceList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: priceListsApi.delete,
    onSuccess:  () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useUpsertPriceListItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { variantId: string; unitPrice: number } }) =>
      priceListsApi.upsertItem(id, body),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: keys.detail(id) }),
  })
}

export function useRemovePriceListItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, itemId }: { id: string; itemId: string }) =>
      priceListsApi.removeItem(id, itemId),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: keys.detail(id) }),
  })
}

export function useClonePriceList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      priceListsApi.clone(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}
