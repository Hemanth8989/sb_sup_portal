import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  warehousesApi,
  type CreateWarehouseBody,
  type UpdateWarehouseBody,
  type TransferSlabsBody,
  type WarehouseProductStockParams,
  type ReceiveStockBody,
  type TransferWarehouseStockBody,
  type AdjustWarehouseStockBody,
  type SetReorderPointBody,
} from '@/lib/api/supplier/warehouses'

const KEYS = {
  all:          ['warehouses']                             as const,
  one:          (id: string) => ['warehouses', id]         as const,
  products:     (id: string) => ['warehouses', id, 'products'] as const,
  movements:    (id: string) => ['warehouses', id, 'movements'] as const,
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

// ── Product stock hooks ───────────────────────────────────────────────────────

export function useWarehouseProducts(warehouseId: string, params?: WarehouseProductStockParams) {
  return useQuery({
    queryKey: [...KEYS.products(warehouseId), params],
    queryFn:  () => warehousesApi.getProducts(warehouseId, params),
    enabled:  !!warehouseId,
  })
}

export function useReceiveWarehouseStock(warehouseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ReceiveStockBody) => warehousesApi.receiveStock(warehouseId, body),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEYS.products(warehouseId) })
      qc.invalidateQueries({ queryKey: KEYS.one(warehouseId) })
      qc.invalidateQueries({ queryKey: KEYS.movements(warehouseId) })
    },
  })
}

export function useTransferWarehouseStock(warehouseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: TransferWarehouseStockBody) => warehousesApi.transferStock(warehouseId, body),
    onSuccess:  (_, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.products(warehouseId) })
      qc.invalidateQueries({ queryKey: KEYS.products(vars.toWarehouseId) })
      qc.invalidateQueries({ queryKey: KEYS.one(warehouseId) })
      qc.invalidateQueries({ queryKey: KEYS.movements(warehouseId) })
    },
  })
}

export function useAdjustWarehouseStock(warehouseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AdjustWarehouseStockBody) => warehousesApi.adjustStock(warehouseId, body),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEYS.products(warehouseId) })
      qc.invalidateQueries({ queryKey: KEYS.one(warehouseId) })
      qc.invalidateQueries({ queryKey: KEYS.movements(warehouseId) })
    },
  })
}

export function useSetWarehouseReorderPoint(warehouseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SetReorderPointBody) => warehousesApi.setReorderPoint(warehouseId, body),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.products(warehouseId) }),
  })
}

export function useStockMovements(warehouseId: string, limit = 100) {
  return useQuery({
    queryKey: [...KEYS.movements(warehouseId), limit],
    queryFn:  () => warehousesApi.getStockMovements(warehouseId, limit),
    enabled:  !!warehouseId,
  })
}
