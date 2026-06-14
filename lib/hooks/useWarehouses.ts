import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { warehousesApi, type CreateWarehouseBody, type UpdateWarehouseBody, type TransferSlabsBody } from '@/lib/api/supplier/warehouses'

const KEYS = {
  all:  ['warehouses']             as const,
  one:  (id: string) => ['warehouses', id] as const,
}

export function useWarehouses() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn:  () => warehousesApi.list(),
  })
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: KEYS.one(id),
    queryFn:  () => warehousesApi.get(id),
    enabled:  !!id,
  })
}

export function useCreateWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateWarehouseBody) => warehousesApi.create(body),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useUpdateWarehouse(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateWarehouseBody) => warehousesApi.update(id, body),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.one(id) })
    },
  })
}

export function useSetPrimaryWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => warehousesApi.setPrimary(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useDeactivateWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => warehousesApi.deactivate(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useTransferSlabs(warehouseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: TransferSlabsBody) => warehousesApi.transferSlabs(warehouseId, body),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.one(warehouseId) })
    },
  })
}
