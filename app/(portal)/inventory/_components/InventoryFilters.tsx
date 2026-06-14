'use client'

import { useSlabFilters } from '@/lib/hooks/useSlabFilters'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { STATUS_CONFIG, MATERIAL_TYPES } from '@/lib/utils/constants'
import type { SlabStatus } from '@/lib/types/api'
import { Search } from 'lucide-react'
import { useRef } from 'react'

const STATUS_CHIPS: SlabStatus[] = ['available', 'reserved', 'hold', 'allocated', 'shipped']

export function InventoryFilters() {
  const [filters, setFilters] = useSlabFilters()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  function onSearch(value: string) {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilters({ searchQuery: value || undefined, page: 1 })
    }, 300)
  }

  function toggleStatus(status: SlabStatus) {
    const current = filters.statuses ?? []
    const next = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]
    setFilters({ statuses: next.length ? next : undefined, page: 1 })
  }

  const activeStatuses = filters.statuses ?? []

  return (
    <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center gap-2 flex-wrap">
      <div className="relative flex-shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <Input
          placeholder="Search material, ref, lot..."
          defaultValue={filters.searchQuery}
          onChange={e => onSearch(e.target.value)}
          className="pl-8 h-8 text-xs w-60"
        />
      </div>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      <button
        onClick={() => setFilters({ statuses: undefined, page: 1 })}
        className={cn(
          'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
          activeStatuses.length === 0
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
        )}
      >
        All
      </button>

      {STATUS_CHIPS.map(status => {
        const cfg    = STATUS_CONFIG[status]
        const active = activeStatuses.includes(status)
        return (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
              active
                ? cn(cfg.bg, cfg.color)
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
            )}
          >
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}
