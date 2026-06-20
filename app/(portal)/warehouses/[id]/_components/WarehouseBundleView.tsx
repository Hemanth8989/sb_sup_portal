'use client'

import { Layers, Globe, Calendar, FileText, Package } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useWarehouseBundles } from '@/lib/hooks/useWarehouses'
import { formatPrice } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'
import type { WarehouseBundleDto } from '@/lib/types/api'

interface Props {
  warehouseId: string
}

const COUNTRY_NAMES: Record<string, string> = {
  IT: 'Italy', BR: 'Brazil', IN: 'India', TR: 'Turkey', CN: 'China',
  PT: 'Portugal', GR: 'Greece', ES: 'Spain', IR: 'Iran', NO: 'Norway',
  ZA: 'South Africa', US: 'United States', CA: 'Canada', MX: 'Mexico',
}

function countryName(code: string | null): string {
  if (!code) { return '' }
  return COUNTRY_NAMES[code.toUpperCase()] ?? code
}

function GroupTypePill({ type }: { type: WarehouseBundleDto['groupType'] }) {
  if (type === 'bundle') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
        Bundle
      </span>
    )
  }
  if (type === 'lot') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
        Lot
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500">
      Ungrouped
    </span>
  )
}

function BundleCard({ b }: { b: WarehouseBundleDto }) {
  const displayRef = b.groupRef ?? '—'
  const country    = countryName(b.originCountry)

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">

      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <GroupTypePill type={b.groupType} />
              <h3 className="text-sm font-bold text-gray-900 truncate font-mono">{displayRef}</h3>
            </div>
            <p className="text-xs text-gray-500 truncate">
              {b.materialName}
              {country && <span className="text-gray-400"> · {country}</span>}
              {b.quarryName && <span className="text-gray-400"> · {b.quarryName}</span>}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-gray-900">{b.slabCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">slabs</p>
          </div>
        </div>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        <div className="px-4 py-2.5 text-center">
          <p className="text-base font-bold text-emerald-700">{b.availableCount}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Available</p>
        </div>
        <div className="px-4 py-2.5 text-center">
          <p className="text-base font-bold text-blue-700">{b.reservedCount}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Reserved</p>
        </div>
        <div className="px-4 py-2.5 text-center">
          <p className="text-base font-bold text-amber-600">{b.onHoldCount}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">On Hold</p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="px-5 py-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Layers className="w-3 h-3 text-gray-400 shrink-0" />
          <span>{b.totalSqft?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '—'} sqft total</span>
        </div>
        {b.estimatedValue != null && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <span className="text-gray-300">·</span>
            <span className="font-semibold text-gray-700">{formatPrice(b.estimatedValue)}</span>
            <span className="text-gray-400">est. value</span>
          </div>
        )}
      </div>

      {/* Meta row */}
      {(b.arrivalDate || b.invoiceRef) && (
        <div className="px-5 pb-3 flex items-center gap-4 text-[11px] text-gray-400">
          {b.arrivalDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(b.arrivalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {b.invoiceRef && (
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {b.invoiceRef}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function WarehouseBundleView({ warehouseId }: Props) {
  const { data: bundles, isPending } = useWarehouseBundles(warehouseId)

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!bundles || bundles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <Package className="w-8 h-8 text-gray-200" />
        <p className="text-sm text-gray-400">No slabs in this warehouse yet.</p>
      </div>
    )
  }

  const bundleGroups  = bundles.filter(b => b.groupType === 'bundle')
  const lotGroups     = bundles.filter(b => b.groupType === 'lot')
  const ungrouped     = bundles.find(b => b.groupType === 'ungrouped')
  const totalSlabs    = bundles.reduce((n, b) => n + b.slabCount, 0)
  const totalSqft     = bundles.reduce((n, b) => n + (b.totalSqft ?? 0), 0)

  return (
    <div className="space-y-6">

      {/* Summary bar */}
      <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600">
        <span><strong className="text-gray-900">{totalSlabs}</strong> slabs total</span>
        <span className="text-gray-300">·</span>
        <span><strong className="text-gray-900">{bundleGroups.length}</strong> bundles</span>
        {lotGroups.length > 0 && (
          <>
            <span className="text-gray-300">·</span>
            <span><strong className="text-gray-900">{lotGroups.length}</strong> lots</span>
          </>
        )}
        <span className="text-gray-300">·</span>
        <span><strong className="text-gray-900">{totalSqft.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> sqft</span>
      </div>

      {/* Bundle cards */}
      {bundleGroups.length > 0 && (
        <section>
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Bundles — {bundleGroups.length}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {bundleGroups.map(b => <BundleCard key={b.bundleId ?? b.groupRef} b={b} />)}
          </div>
        </section>
      )}

      {/* Lot cards */}
      {lotGroups.length > 0 && (
        <section>
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Lots — {lotGroups.length}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {lotGroups.map(b => <BundleCard key={b.groupRef} b={b} />)}
          </div>
        </section>
      )}

      {/* Ungrouped */}
      {ungrouped && (
        <section>
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Ungrouped
          </h3>
          <div className={cn('grid gap-4', bundleGroups.length + lotGroups.length > 0 ? 'grid-cols-2' : 'grid-cols-1 max-w-sm')}>
            <BundleCard b={ungrouped} />
          </div>
        </section>
      )}
    </div>
  )
}
