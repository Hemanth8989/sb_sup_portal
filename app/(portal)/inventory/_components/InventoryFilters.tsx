'use client'

import { useSlabFilters } from '@/lib/hooks/useSlabFilters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { STATUS_CONFIG } from '@/lib/utils/constants'
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
    const next = current.includes(status) ? current.filter(s => s !== status) : [...current, status]
    setFilters({ statuses: next.length ? next : undefined, page: 1 })
  }

  const activeStatuses = filters.statuses ?? []

  return (
    <div className="px-6 py-3 flex items-center gap-2 flex-wrap">
      {/* shadcn Input with search icon */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search material, ref, lot..."
          defaultValue={filters.searchQuery}
          onChange={e => onSearch(e.target.value)}
          className="pl-8 h-8 w-56 text-sm"
        />
      </div>

      <Separator orientation="vertical" className="h-5" />

      <Button
        size="sm"
        variant={activeStatuses.length === 0 ? 'default' : 'ghost'}
        onClick={() => setFilters({ statuses: undefined, page: 1 })}
      >
        All
      </Button>

      {STATUS_CHIPS.map(status => {
        const active = activeStatuses.includes(status)
        const cfg = STATUS_CONFIG[status]
        return (
          <Button
            key={status}
            size="sm"
            variant={active ? 'secondary' : 'ghost'}
            onClick={() => toggleStatus(status)}
            className={cn(active && cn(cfg.bg, cfg.color, 'hover:opacity-90'))}
          >
            {cfg.label}
          </Button>
        )
      })}
    </div>
  )
}
