'use client'

import { useSupplierSlabs } from '@/lib/hooks/useSupplierSlabs'
import { useSlabFilters } from '@/lib/hooks/useSlabFilters'
import { SlabStatusBadge } from './SlabStatusBadge'
import { SlabActionsMenu } from './SlabActionsMenu'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDimensions, formatSqft, formatPrice, formatThickness } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, ChevronsUpDown, Image } from 'lucide-react'

function SortHeader({ label, field }: { label: string; field: string }) {
  const [filters, setFilters] = useSlabFilters()
  const active = filters.sortBy === field
  const dir    = filters.sortDir ?? 'desc'

  function toggle() {
    if (active) {
      setFilters({ sortDir: dir === 'asc' ? 'desc' : 'asc' })
    } else {
      setFilters({ sortBy: field, sortDir: 'desc' })
    }
  }

  return (
    <button onClick={toggle} className="flex items-center gap-1 group">
      {label}
      {active
        ? dir === 'asc'
          ? <ArrowUp className="w-3 h-3 text-indigo-500" />
          : <ArrowDown className="w-3 h-3 text-indigo-500" />
        : <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-400" />}
    </button>
  )
}

function GradeBadge({ grade }: { grade: string }) {
  const cls = grade === 'A'
    ? 'bg-green-50 text-green-700'
    : grade === 'B'
    ? 'bg-yellow-50 text-yellow-700'
    : 'bg-slate-100 text-slate-600'
  return (
    <span className={cn('inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold', cls)}>
      {grade}
    </span>
  )
}

export function InventoryTable() {
  const [filters, setFilters] = useSlabFilters()
  const { data, isPending, isError } = useSupplierSlabs(filters)

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
        Failed to load inventory. Check that the API is running.
      </div>
    )
  }

  const slabs      = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const page       = data?.page ?? 1
  const perPage    = data?.perPage ?? 50
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6 pt-3">
      <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-slate-200">
              <th className="w-9 px-3 py-2.5 text-left">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-3 py-2.5 text-left w-12">Photo</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">
                <SortHeader label="Material / Ref" field="material_name" />
              </th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Dimensions</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">
                <SortHeader label="Net sqft" field="net_sqft" />
              </th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Finish</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Grade</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Location</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">
                <SortHeader label="Price/sqft" field="effective_price" />
              </th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">
                <SortHeader label="Status" field="status" />
              </th>
              <th className="px-3 py-2.5 w-9" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isPending
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={j} className="px-3 py-3">
                        <Skeleton className="h-4 w-full rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              : slabs.length === 0
              ? (
                  <tr>
                    <td colSpan={11} className="text-center py-16 text-slate-400">
                      No slabs found. Try adjusting your filters.
                    </td>
                  </tr>
                )
              : slabs.map(slab => (
                  <tr key={slab.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-3 py-2.5">
                      {slab.primaryThumbUrl
                        ? (
                            <div className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-200">
                              <img src={slab.primaryThumbUrl} alt="" className="w-full h-full object-cover" />
                              {slab.photoCount > 1 && (
                                <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] rounded px-0.5">
                                  +{slab.photoCount - 1}
                                </span>
                              )}
                            </div>
                          )
                        : (
                            <div className="w-10 h-10 rounded-md border border-slate-200 bg-slate-100 flex items-center justify-center">
                              <Image className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-slate-900">{slab.materialName}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {slab.internalRef}{slab.lotNumber ? ` · Lot ${slab.lotNumber}` : ''}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="text-slate-700">{formatDimensions(slab.grossLengthMm, slab.grossWidthMm)}</div>
                      <div className="text-slate-400 text-[11px]">{formatThickness(slab.thicknessCm)}</div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{formatSqft(slab.netSqft)}</td>
                    <td className="px-3 py-2.5 capitalize text-slate-600">{slab.finish}</td>
                    <td className="px-3 py-2.5">
                      <GradeBadge grade={slab.qualityGrade} />
                    </td>
                    <td className="px-3 py-2.5">
                      {slab.rackLocation && (
                        <div className="text-slate-700">{slab.rackLocation}</div>
                      )}
                      {slab.warehouseName && (
                        <div className="text-slate-400 text-[11px]">{slab.warehouseName}</div>
                      )}
                      {!slab.rackLocation && !slab.warehouseName && (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-slate-900">
                        {formatPrice(slab.effectivePrice)}
                      </div>
                      {slab.priceOverride != null && slab.basePrice != null && (
                        <div className="text-slate-400 text-[11px] line-through">{formatPrice(slab.basePrice)}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <SlabStatusBadge status={slab.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      <SlabActionsMenu slab={slab} />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-500">
          {isPending ? '…' : `Showing ${Math.min((page - 1) * perPage + 1, totalCount)}–${Math.min(page * perPage, totalCount)} of ${totalCount} slabs`}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => setFilters({ page: page - 1 })}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded bg-white disabled:opacity-40 hover:bg-slate-50"
          >
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setFilters({ page: p })}
              className={cn(
                'px-2.5 py-1 text-xs border rounded',
                p === page
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white border-slate-200 hover:bg-slate-50',
              )}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => setFilters({ page: page + 1 })}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded bg-white disabled:opacity-40 hover:bg-slate-50"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
