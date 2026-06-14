'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupplierSlabs, getInventorySummary, updateSlabStatus, deleteSlab } from '@/lib/api/supplier/slabs'
import type { SupplierSlabFilterParams } from '@/lib/types/api'

export const slabKeys = {
  all:     () => ['supplier', 'slabs'] as const,
  list:    (filters: SupplierSlabFilterParams) => [...slabKeys.all(), 'list', filters] as const,
  summary: () => ['supplier', 'slabs', 'summary'] as const,
}

export function useSupplierSlabs(filters: SupplierSlabFilterParams) {
  return useQuery({
    queryKey: slabKeys.list(filters),
    queryFn:  () => getSupplierSlabs(filters),
    staleTime: 30_000,
  })
}

export function useInventorySummary() {
  return useQuery({
    queryKey: slabKeys.summary(),
    queryFn:  getInventorySummary,
    staleTime: 60_000,
  })
}

export function useUpdateSlabStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slabId, status }: { slabId: string; status: string }) =>
      updateSlabStatus(slabId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: slabKeys.all() })
    },
  })
}

export function useDeleteSlab() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slabId: string) => deleteSlab(slabId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: slabKeys.all() })
    },
  })
}
