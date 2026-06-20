'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSupplierSlabs, getSlab, getInventorySummary,
  createSlab, updateSlab, updateSlabStatus, setSlabPrice,
  bulkUpdateSlabStatus, deleteSlab,
  type CreateSlabBody, type UpdateSlabBody,
} from '@/lib/api/supplier/slabs'
import type { SupplierSlabFilterParams } from '@/lib/types/api'

export const slabKeys = {
  all:     () => ['supplier', 'slabs'] as const,
  list:    (filters: SupplierSlabFilterParams) => [...slabKeys.all(), 'list', filters] as const,
  detail:  (id: string) => [...slabKeys.all(), 'detail', id] as const,
  summary: () => ['supplier', 'slabs', 'summary'] as const,
}

export function useSupplierSlabs(filters: SupplierSlabFilterParams) {
  return useQuery({
    queryKey: slabKeys.list(filters),
    queryFn:  () => getSupplierSlabs(filters),
    staleTime: 30_000,
  })
}

export function useSlab(id: string) {
  return useQuery({
    queryKey: slabKeys.detail(id),
    queryFn:  () => getSlab(id),
    enabled:  !!id,
  })
}

export function useInventorySummary() {
  return useQuery({
    queryKey: slabKeys.summary(),
    queryFn:  getInventorySummary,
    staleTime: 60_000,
  })
}

export function useCreateSlab() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateSlabBody) => createSlab(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: slabKeys.all() }),
  })
}

export function useUpdateSlab() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateSlabBody }) => updateSlab(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: slabKeys.detail(id) })
      qc.invalidateQueries({ queryKey: slabKeys.all() })
    },
  })
}

export function useUpdateSlabStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slabId, status }: { slabId: string; status: string }) =>
      updateSlabStatus(slabId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: slabKeys.all() }),
  })
}

export function useSetSlabPrice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slabId, price }: { slabId: string; price: number | null }) =>
      setSlabPrice(slabId, price),
    onSuccess: () => qc.invalidateQueries({ queryKey: slabKeys.all() }),
  })
}

export function useBulkUpdateSlabStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slabIds, status }: { slabIds: string[]; status: string }) =>
      bulkUpdateSlabStatus(slabIds, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: slabKeys.all() }),
  })
}

export function useDeleteSlab() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slabId: string) => deleteSlab(slabId),
    onSuccess: () => qc.invalidateQueries({ queryKey: slabKeys.all() }),
  })
}
