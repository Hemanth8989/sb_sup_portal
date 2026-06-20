'use client'

import { useState } from 'react'
import {
  useSupplierSlabs,
  useBulkUpdateSlabStatus,
} from '@/lib/hooks/useSupplierSlabs'
import { SlabStatusBadge } from '@/app/(portal)/inventory/_components/SlabStatusBadge'
import { SlabActionsMenu } from '@/app/(portal)/inventory/_components/SlabActionsMenu'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { formatDimensions, formatSqft, formatPrice, formatThickness } from '@/lib/utils/formatters'
import {
  Search, PauseCircle, PlayCircle, ArrowRightLeft,
  ChevronLeft, ChevronRight, ImageIcon, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SlabStatus } from '@/lib/types/api'

const STATUS_CHIPS: { key: SlabStatus; label: string; active: string; inactive: string }[] = [
  { key: 'available', label: 'Available', active: 'bg-emerald-50 text-emerald-700 border-emerald-200', inactive: 'bg-white text-gray-500 border-gray-200 hover:border-gray-300' },
  { key: 'reserved',  label: 'Reserved',  active: 'bg-blue-50 text-blue-700 border-blue-200',         inactive: 'bg-white text-gray-500 border-gray-200 hover:border-gray-300' },
  { key: 'hold',      label: 'On Hold',   active: 'bg-amber-50 text-amber-700 border-amber-200',      inactive: 'bg-white text-gray-500 border-gray-200 hover:border-gray-300' },
  { key: 'allocated', label: 'Allocated', active: 'bg-violet-50 text-violet-700 border-violet-200',   inactive: 'bg-white text-gray-500 border-gray-200 hover:border-gray-300' },
  { key: 'shipped',   label: 'Shipped',   active: 'bg-gray-100 text-gray-600 border-gray-300',        inactive: 'bg-white text-gray-500 border-gray-200 hover:border-gray-300' },
]

interface Props {
  warehouseId: string
  onTransferRequest?: (ids: string[]) => void
}

export function WarehouseSlabTable({ warehouseId, onTransferRequest }: Props) {
  const [search,   setSearch]   = useState('')
  const [statuses, setStatuses] = useState<SlabStatus[]>([])
  const [page,     setPage]     = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const PER_PAGE = 50

  const { data, isPending, isError } = useSupplierSlabs({
    warehouseId,
    searchQuery: search || undefined,
    statuses:    statuses.length ? statuses : undefined,
    page,
    perPage: PER_PAGE,
  })

  const bulkStatus  = useBulkUpdateSlabStatus()
  const slabs       = data?.items ?? []
  const totalCount  = data?.totalCount ?? 0
  const totalPages  = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const startItem   = Math.min((page - 1) * PER_PAGE + 1, totalCount)
  const endItem     = Math.min(page * PER_PAGE, totalCount)
  const allPageIds  = slabs.map(s => s.id)
  const allSelected = allPageIds.length > 0 && allPageIds.every(id => selected.has(id))

  function toggleAll() {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); allPageIds.forEach(id => n.delete(id)); return n })
    } else {
      setSelected(prev => { const n = new Set(prev); allPageIds.forEach(id => n.add(id)); return n })
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const n = new Set(prev)
      if (n.has(id)) { n.delete(id) } else { n.add(id) }
      return n
    })
  }

  function toggleStatus(s: SlabStatus) {
    setStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Ref, material, lot…"
            className="pl-8 h-8 w-44 text-sm border-gray-200"
          />
        </div>

        <div className="h-5 w-px bg-gray-200" />

        <div className="flex items-center gap-1">
          {STATUS_CHIPS.map(s => (
            <button
              key={s.key}
              onClick={() => toggleStatus(s.key)}
              className={cn(
                'px-2.5 h-7 rounded-md border text-[11px] font-medium transition-colors',
                statuses.includes(s.key) ? s.active : s.inactive,
              )}
            >
              {s.label}
            </button>
          ))}
          {statuses.length > 0 && (
            <button
              onClick={() => { setStatuses([]); setPage(1) }}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1" />

        {!isPending && (
          <span className="text-xs text-gray-400">{totalCount} slab{totalCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-gray-900 text-white rounded-lg px-4 py-2.5">
          <span className="text-xs font-semibold">{selected.size} selected</span>
          <div className="flex-1" />
          <Button
            size="sm"
            className="h-7 text-xs bg-white/10 hover:bg-white/20 border-0 gap-1.5"
            disabled={bulkStatus.isPending}
            onClick={() => bulkStatus.mutate({ slabIds: [...selected], status: 'hold' }, { onSuccess: () => setSelected(new Set()) })}
          >
            <PauseCircle className="w-3.5 h-3.5" /> Hold
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs bg-white/10 hover:bg-white/20 border-0 gap-1.5"
            disabled={bulkStatus.isPending}
            onClick={() => bulkStatus.mutate({ slabIds: [...selected], status: 'available' }, { onSuccess: () => setSelected(new Set()) })}
          >
            <PlayCircle className="w-3.5 h-3.5" /> Release
          </Button>
          {onTransferRequest && (
            <Button
              size="sm"
              className="h-7 text-xs bg-white/10 hover:bg-white/20 border-0 gap-1.5"
              onClick={() => onTransferRequest([...selected])}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer
            </Button>
          )}
          <button
            onClick={() => setSelected(new Set())}
            className="text-white/50 hover:text-white text-xs transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-200 hover:bg-gray-50">
              <TableHead className="w-10 pl-4">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
              </TableHead>
              <TableHead className="w-10 text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Photo</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Material</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Dimensions</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide text-right">Net sqft</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Finish</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide text-center">Grade</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Rack</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide text-right">Price/sqft</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-gray-100">
                    {Array.from({ length: 11 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 rounded" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : isError
              ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={11} className="text-center py-14 text-sm text-gray-400">
                      Failed to load slabs.
                    </TableCell>
                  </TableRow>
                )
              : slabs.length === 0
              ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={11} className="text-center py-16">
                      <p className="text-sm font-medium text-gray-500">No slabs found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {search || statuses.length ? 'Try adjusting your filters.' : 'Add slabs from the Inventory page to assign them here.'}
                      </p>
                    </TableCell>
                  </TableRow>
                )
              : slabs.map(slab => (
                  <TableRow key={slab.id} className="border-gray-100 group hover:bg-gray-50/50">
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selected.has(slab.id)}
                        onCheckedChange={() => toggleOne(slab.id)}
                        aria-label={`Select ${slab.internalRef}`}
                      />
                    </TableCell>
                    <TableCell>
                      {slab.primaryThumbUrl
                        ? (
                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                              <img src={slab.primaryThumbUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          )
                        : (
                            <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
                            </div>
                          )}
                    </TableCell>
                    <TableCell>
                      <p className="text-[13px] font-semibold text-gray-900">{slab.materialName}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {slab.internalRef}
                        {slab.lotNumber ? <span> · Lot {slab.lotNumber}</span> : null}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-[13px] text-gray-700">{formatDimensions(slab.grossLengthMm, slab.grossWidthMm)}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{formatThickness(slab.thicknessCm)}</p>
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-gray-700">
                      {formatSqft(slab.netSqft)}
                    </TableCell>
                    <TableCell className="text-[13px] text-gray-500 capitalize">{slab.finish}</TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        'inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-bold border',
                        slab.qualityGrade === 'A' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        slab.qualityGrade === 'B' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-50 text-gray-500 border-gray-200',
                      )}>
                        {slab.qualityGrade}
                      </span>
                    </TableCell>
                    <TableCell className="text-[13px] text-gray-500">
                      {slab.rackLocation ?? <span className="text-gray-300">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="text-[13px] font-semibold text-gray-900">
                        {formatPrice(slab.effectivePrice ?? 0)}
                      </p>
                      {slab.priceOverride != null && slab.basePrice != null && (
                        <p className="text-[11px] text-gray-400 line-through">{formatPrice(slab.basePrice)}</p>
                      )}
                    </TableCell>
                    <TableCell><SlabStatusBadge status={slab.status} /></TableCell>
                    <TableCell className="pr-3">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <SlabActionsMenu slab={slab} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {startItem}–{endItem} of {totalCount}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm" className="h-7 w-7 p-0 border-gray-200"
              disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs text-gray-500 px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline" size="sm" className="h-7 w-7 p-0 border-gray-200"
              disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
