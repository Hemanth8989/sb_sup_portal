'use client'

import { useRef } from 'react'
import { useSlabFilters } from '@/lib/hooks/useSlabFilters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { STATUS_CONFIG } from '@/lib/utils/constants'
import type { SlabStatus } from '@/lib/types/api'
import { Search, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const STATUS_CHIPS: SlabStatus[] = ['available', 'reserved', 'hold', 'allocated', 'shipped']

const MATERIAL_OPTIONS = [
  'granite','marble','quartzite','quartz','porcelain',
  'dekton','limestone','travertine','onyx','slate','soapstone','other',
]
const COLOR_OPTIONS = ['white','cream','beige','gray','charcoal','black','blue','green','red','brown','gold','multi']
const FINISH_OPTIONS = ['polished','honed','leathered','brushed','sandblasted','flamed','natural']

function MultiPickDropdown({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1 px-2.5 h-8 rounded-md border text-xs font-medium transition-colors',
          selected.length > 0
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400',
        )}
      >
        {label}
        {selected.length > 0 && <span className="ml-0.5 bg-white/20 rounded px-1">{selected.length}</span>}
        <ChevronDown className="w-3 h-3 ml-0.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-9 z-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px]">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-xs capitalize flex items-center gap-2 hover:bg-gray-50 transition-colors',
                  selected.includes(opt) && 'font-medium',
                )}
              >
                <span className={cn(
                  'w-3 h-3 rounded-sm border flex-shrink-0',
                  selected.includes(opt) ? 'bg-gray-900 border-gray-900' : 'border-gray-300',
                )} />
                {opt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

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

  function toggleMulti(key: 'materialTypes' | 'colorFamilies' | 'finishes', value: string) {
    const current = (filters[key] as string[] | undefined) ?? []
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    setFilters({ [key]: next.length ? next : undefined, page: 1 })
  }

  const activeStatuses   = filters.statuses ?? []
  const activeMaterials  = (filters.materialTypes as string[] | undefined) ?? []
  const activeColors     = (filters.colorFamilies as string[] | undefined) ?? []
  const activeFinishes   = (filters.finishes as string[] | undefined) ?? []

  const hasAdvanced = activeMaterials.length > 0 || activeColors.length > 0 || activeFinishes.length > 0

  function clearAll() {
    setFilters({ statuses: undefined, materialTypes: undefined, colorFamilies: undefined, finishes: undefined, searchQuery: undefined, page: 1 })
  }

  return (
    <div className="px-6 py-3 flex items-center gap-2 flex-wrap border-b border-gray-50 bg-white shrink-0">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search material, ref, lot..."
          defaultValue={filters.searchQuery}
          onChange={e => onSearch(e.target.value)}
          className="pl-8 h-8 w-52 text-sm"
        />
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Status chips */}
      <Button
        size="sm"
        variant={activeStatuses.length === 0 ? 'default' : 'ghost'}
        onClick={() => setFilters({ statuses: undefined, page: 1 })}
        className="h-8"
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
            className={cn('h-8', active && cn(cfg.bg, cfg.color, 'hover:opacity-90'))}
          >
            {cfg.label}
          </Button>
        )
      })}

      <Separator orientation="vertical" className="h-5" />

      {/* Advanced filter dropdowns */}
      <MultiPickDropdown
        label="Material"
        options={MATERIAL_OPTIONS}
        selected={activeMaterials}
        onToggle={v => toggleMulti('materialTypes', v)}
      />
      <MultiPickDropdown
        label="Color"
        options={COLOR_OPTIONS}
        selected={activeColors}
        onToggle={v => toggleMulti('colorFamilies', v)}
      />
      <MultiPickDropdown
        label="Finish"
        options={FINISH_OPTIONS}
        selected={activeFinishes}
        onToggle={v => toggleMulti('finishes', v)}
      />

      {/* Remnant toggle */}
      <button
        onClick={() => setFilters({ isRemnant: filters.isRemnant ? undefined : true, page: 1 })}
        className={cn(
          'px-2.5 h-8 rounded-md border text-xs font-medium transition-colors',
          filters.isRemnant
            ? 'bg-amber-50 border-amber-300 text-amber-700'
            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400',
        )}
      >
        Remnants
      </button>

      {(activeStatuses.length > 0 || hasAdvanced || filters.isRemnant) && (
        <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-gray-900 transition-colors ml-1">
          Clear all
        </button>
      )}
    </div>
  )
}
