'use client'

import { useState } from 'react'
import { useSupplierSlabs, useUpdateSlabStatus, useDeleteSlab, useBulkUpdateSlabStatus } from '@/lib/hooks/useSupplierSlabs'
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
import { Badge } from '@/components/ui/badge'
import { ImageIcon, Search, PauseCircle, PlayCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { SupplierSlabDto, SlabStatus } from '@/lib/types/api'

const STATUS_CHIPS: SlabStatus[] = ['available', 'reserved', 'hold', 'allocated', 'shipped']

const STATUS_COLOR: Record<string, string> = {
  available:  'bg-green-50 text-green-700',
  reserved:   'bg-blue-50 text-blue-700',
  hold:       'bg-amber-50 text-amber-700',
  allocated:  'bg-violet-50 text-violet-700',
  shipped:    'bg-gray-100 text-gray-500',
  sold:       'bg-gray-100 text-gray-400',
}

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
    perPage:     PER_PAGE,
  })

  const bulkStatus = useBulkUpdateSlabStatus()

  const slabs      = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const startItem  = Math.min((page - 1) * PER_PAGE + 1, totalCount)
  const endItem    = Math.min(page * PER_PAGE, totalCount)

  const allPageIds    = slabs.map(s => s.id)
  const allPageSelected = allPageIds.length > 0 && allPageIds.every(id => selected.has(id))
  const someSelected  = selected.size > 0

  function toggleAll() {
    if (allPageSelected) {
      setSelected(prev => { const next = new Set(prev); allPageIds.forEach(id => next.delete(id)); return next })
    } else {
      setSelected(prev => { const next = new Set(prev); allPageIds.forEach(id => next.add(id)); return next })
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function toggleStatusFilter(s: SlabStatus) {
    setStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
    setPage(1)
  }

  function handleBulkStatus(status: string) {
    bulkStatus.mutate(
      { slabIds: [...selected], status },
      { onSuccess: () => setSelected(new Set()) },
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Filter / search bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search ref, material…"
            className="pl-8 h-8 text-sm w-48"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_CHIPS.map(s => (
            <button
              key={s}
              onClick={() => toggleStatusFilter(s)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize transition-colors ${
                statuses.includes(s) ? STATUS_COLOR[s] + ' ring-1 ring-current' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {!isPending && (
          <span className="text-xs text-muted-foreground">{totalCount} slabs</span>
        )}
      </div>

      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-2">
          <span className="text-xs font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" className="h-7 text-xs text-white hover:bg-white/10 gap-1"
            disabled={bulkStatus.isPending}
            onClick={() => handleBulkStatus('hold')}
          >
            <PauseCircle className="w-3.5 h-3.5" /> Hold
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs text-white hover:bg-white/10 gap-1"
            disabled={bulkStatus.isPending}
            onClick={() => handleBulkStatus('available')}
          >
            <PlayCircle className="w-3.5 h-3.5" /> Release
          </Button>
          {onTransferRequest && (
            <Button size="sm" variant="ghost" className="h-7 text-xs text-white hover:bg-white/10 gap-1"
              onClick={() => onTransferRequest([...selected])}
            >
              Transfer
            </Button>
          )}
          <button onClick={() => setSelected(new Set())} className="text-white/60 hover:text-white text-xs ml-2">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Photo</TableHead>
              <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Material</TableHead>
              <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Dimensions</TableHead>
              <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Net sqft</TableHead>
              <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Finish</TableHead>
              <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Grade</TableHead>
              <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Rack</TableHead>
              <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Price/sqft</TableHead>
              <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-gray-50 hover:bg-transparent">
                    {Array.from({ length: 11 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 rounded" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : isError
              ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={11} className="text-center py-12 text-sm text-muted-foreground">
                      Failed to load slabs.
                    </TableCell>
                  </TableRow>
                )
              : slabs.length === 0
              ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={11} className="text-center py-16 text-sm text-muted-foreground">
                      No slabs in this warehouse.
                    </TableCell>
                  </TableRow>
                )
              : slabs.map(slab => (
                  <TableRow key={slab.id} className="border-gray-50 group">
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
                            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-border">
                              <img src={slab.primaryThumbUrl} alt="" className="w-full h-full object-cover" />
                              {slab.photoCount > 1 && (
                                <Badge className="absolute bottom-0.5 right-0.5 px-1 py-px text-[9px] h-auto min-w-0 rounded-sm bg-black/60 text-white border-0">
                                  +{slab.photoCount - 1}
                                </Badge>
                              )}
                            </div>
                          )
                        : (
                            <div className="w-9 h-9 rounded-lg border border-border bg-muted flex items-center justify-center">
                              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground/40" />
                            </div>
                          )}
                    </TableCell>
                    <TableCell>
                      <p className="text-[13px] font-medium text-foreground">{slab.materialName}</p>
                      <p className="text-[11px] text-muted-foreground">{slab.internalRef}{slab.lotNumber ? ` · Lot ${slab.lotNumber}` : ''}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-[13px] text-foreground">{formatDimensions(slab.grossLengthMm, slab.grossWidthMm)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatThickness(slab.thicknessCm)}</p>
                    </TableCell>
                    <TableCell className="text-[13px] text-foreground">{formatSqft(slab.netSqft)}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground capitalize">{slab.finish}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`w-6 h-6 rounded justify-center text-[11px] font-semibold p-0 ${
                        slab.qualityGrade === 'A' ? 'bg-green-50 text-green-700 border-green-100' :
                        slab.qualityGrade === 'B' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-muted text-muted-foreground'
                      }`}>{slab.qualityGrade}</Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {slab.rackLocation ?? <span className="text-muted-foreground/30">—</span>}
                    </TableCell>
                    <TableCell>
                      <p className="text-[13px] font-medium text-foreground">{formatPrice(slab.effectivePrice ?? 0)}</p>
                      {slab.priceOverride != null && slab.basePrice != null && (
                        <p className="text-[11px] text-muted-foreground line-through">{formatPrice(slab.basePrice)}</p>
                      )}
                    </TableCell>
                    <TableCell><SlabStatusBadge status={slab.status} /></TableCell>
                    <TableCell className="pr-2">
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
          <span className="text-xs text-muted-foreground">
            {totalCount === 0 ? 'No slabs' : `${startItem}–${endItem} of ${totalCount}`}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
