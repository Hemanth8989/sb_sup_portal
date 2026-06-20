import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { purchaseOrdersApi } from '../api/supplier/purchase-orders'

const keys = {
  all:    ['purchase-orders']                     as const,
  list:   (p: object) => ['purchase-orders', p]   as const,
  detail: (id: string) => ['purchase-orders', id]  as const,
}

export function usePurchaseOrders(params: { status?: string; search?: string; page?: number; perPage?: number } = {}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn:  () => purchaseOrdersApi.list(params),
  })
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn:  () => purchaseOrdersApi.get(id),
    enabled:  !!id,
  })
}

export function useAcknowledgePo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { supplierNotes?: string; confirmedDelivery?: string } }) =>
      purchaseOrdersApi.acknowledge(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) })
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useShipPo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { trackingNumber: string; carrier?: string; confirmedDelivery?: string } }) =>
      purchaseOrdersApi.ship(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) })
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useCancelPo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      purchaseOrdersApi.cancel(id, reason),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) })
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useUpdatePoNotes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string | null }) =>
      purchaseOrdersApi.updateNotes(id, notes),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) })
    },
  })
}

export function useUpdatePoStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status: string; note?: string; supplierNotes?: string } }) =>
      purchaseOrdersApi.updateStatus(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) })
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}
