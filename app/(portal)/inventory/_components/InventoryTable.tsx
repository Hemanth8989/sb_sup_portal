'use client'

import { useSupplierSlabs } from '@/lib/hooks/useSupplierSlabs'
import { useSlabFilters } from '@/lib/hooks/useSlabFilters'
import { SlabStatusBadge } from './SlabStatusBadge'
import { SlabActionsMenu } from './SlabActionsMenu'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from '@/components/ui/table'
import { formatDimensions, formatSqft, formatPrice, formatThickness } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, ChevronsUpDown, ImageIcon } from 'lucide-react'

function SortHead({ label, field }: { label: string; field: string }) {
  const [filters, setFilters] = useSlabFilters()
  const active = filters.sortBy === field
  const dir    = filters.sortDir ?? 'desc'

  return (
    <TableHead>
      <button
        onClick={() => {
          if (active) setFilters({ sortDir: dir === 'asc' ? 'desc' : 'asc' })
          else setFilters({ sortBy: field, sortDir: 'desc' })
        }}
        className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors group"
      >
        {label}
        {active
          ? dir === 'asc'
            ? <ArrowUp className="w-3 h-3 text-foreground" />
            : <ArrowDown className="w-3 h-3 text-foreground" />
          : <ChevronsUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />}
      </button>
    </TableHead>
  )
}

function StaticHead({ label }: { label: string }) {
  return (
    <TableHead className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
      {label}
    </TableHead>
  )
}

export function InventoryTable() {
  const [filters, setFilters] = useSlabFilters()
  const { data, isPending, isError } = useSupplierSlabs(filters)

  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">Failed to load inventory.</p>
        <p className="text-xs text-muted-foreground/60">Make sure the API is running at localhost:5000</p>
      </div>
    )
  }

  const slabs      = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const page       = data?.page ?? 1
  const perPage    = data?.perPage ?? 50
  const totalPages = data?.totalPages ?? 1
  const startItem  = Math.min((page - 1) * perPage + 1, totalCount)
  const endItem    = Math.min(page * perPage, totalCount)

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6 pt-3">
      {/* shadcn Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-100 bg-background">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="w-10 pl-4">
                <Checkbox aria-label="Select all" />
              </TableHead>
              <StaticHead label="Photo" />
              <SortHead label="Material" field="material_name" />
              <StaticHead label="Dimensions" />
              <SortHead label="Net sqft" field="net_sqft" />
              <StaticHead label="Finish" />
              <StaticHead label="Grade" />
              <StaticHead label="Location" />
              <SortHead label="Price / sqft" field="effective_price" />
              <SortHead label="Status" field="status" />
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isPending
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-gray-50 hover:bg-transparent">
                    {Array.from({ length: 11 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : slabs.length === 0
              ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={11} className="text-center py-20 text-sm text-muted-foreground">
                      No slabs found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                )
              : slabs.map(slab => (
                  <TableRow key={slab.id} className="border-gray-50 group">
                    {/* Checkbox */}
                    <TableCell className="pl-4">
                      <Checkbox aria-label={`Select ${slab.internalRef}`} />
                    </TableCell>

                    {/* Photo */}
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

                    {/* Material */}
                    <TableCell>
                      <p className="text-[13px] font-medium text-foreground">{slab.materialName}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {slab.internalRef}{slab.lotNumber ? ` · Lot ${slab.lotNumber}` : ''}
                      </p>
                    </TableCell>

                    {/* Dimensions */}
                    <TableCell>
                      <p className="text-[13px] text-foreground">{formatDimensions(slab.grossLengthMm, slab.grossWidthMm)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatThickness(slab.thicknessCm)}</p>
                    </TableCell>

                    {/* Sqft */}
                    <TableCell className="text-[13px] text-foreground">
                      {formatSqft(slab.netSqft)}
                    </TableCell>

                    {/* Finish */}
                    <TableCell className="text-[13px] text-muted-foreground capitalize">
                      {slab.finish}
                    </TableCell>

                    {/* Grade */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'w-6 h-6 rounded justify-center text-[11px] font-semibold p-0',
                          slab.qualityGrade === 'A' && 'bg-green-50 text-green-700 border-green-100',
                          slab.qualityGrade === 'B' && 'bg-amber-50 text-amber-700 border-amber-100',
                          slab.qualityGrade === 'C' && 'bg-muted text-muted-foreground',
                        )}
                      >
                        {slab.qualityGrade}
                      </Badge>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      {slab.rackLocation && <p className="text-[13px] text-foreground">{slab.rackLocation}</p>}
                      {slab.warehouseName && <p className="text-[11px] text-muted-foreground">{slab.warehouseName}</p>}
                      {!slab.rackLocation && !slab.warehouseName && <span className="text-muted-foreground/30">—</span>}
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <p className="text-[13px] font-medium text-foreground">{formatPrice(slab.effectivePrice)}</p>
                      {slab.priceOverride != null && slab.basePrice != null && (
                        <p className="text-[11px] text-muted-foreground line-through">{formatPrice(slab.basePrice)}</p>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <SlabStatusBadge status={slab.status} />
                    </TableCell>

                    {/* Actions */}
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
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-muted-foreground">
          {isPending ? '…' : totalCount === 0 ? 'No results' : `${startItem}–${endItem} of ${totalCount} slabs`}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="xs" disabled={page <= 1} onClick={() => setFilters({ page: page - 1 })}>
            ←
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <Button
              key={p}
              size="xs"
              variant={p === page ? 'default' : 'outline'}
              onClick={() => setFilters({ page: p })}
            >
              {p}
            </Button>
          ))}
          <Button variant="outline" size="xs" disabled={page >= totalPages} onClick={() => setFilters({ page: page + 1 })}>
            →
          </Button>
        </div>
      </div>
    </div>
  )
}
