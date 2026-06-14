'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import type { SlabStatus, SupplierSlabFilterParams } from '@/lib/types/api'

export function useSlabFilters(): [SupplierSlabFilterParams, (patch: Partial<SupplierSlabFilterParams>) => void] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: SupplierSlabFilterParams = {
    searchQuery:   searchParams.get('q') ?? undefined,
    statuses:      (searchParams.getAll('status') as SlabStatus[]) || undefined,
    materialTypes: searchParams.getAll('material') as SupplierSlabFilterParams['materialTypes'],
    warehouseId:   searchParams.get('warehouse') ?? undefined,
    sortBy:        searchParams.get('sortBy') ?? 'created_at',
    sortDir:       (searchParams.get('sortDir') as 'asc' | 'desc') ?? 'desc',
    page:          Number(searchParams.get('page') ?? 1),
    perPage:       Number(searchParams.get('perPage') ?? 50),
  }

  const setFilters = useCallback(
    (patch: Partial<SupplierSlabFilterParams>) => {
      const params = new URLSearchParams(searchParams.toString())

      if ('searchQuery' in patch) {
        patch.searchQuery ? params.set('q', patch.searchQuery) : params.delete('q')
      }
      if ('statuses' in patch) {
        params.delete('status')
        patch.statuses?.forEach(s => params.append('status', s))
      }
      if ('materialTypes' in patch) {
        params.delete('material')
        patch.materialTypes?.forEach(m => params.append('material', m))
      }
      if ('page' in patch) {
        patch.page && patch.page > 1 ? params.set('page', String(patch.page)) : params.delete('page')
      }
      if ('sortBy'  in patch && patch.sortBy)  params.set('sortBy',  patch.sortBy)
      if ('sortDir' in patch && patch.sortDir) params.set('sortDir', patch.sortDir)

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname],
  )

  return [filters, setFilters]
}
