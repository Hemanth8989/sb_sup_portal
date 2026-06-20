'use client'

import { formatPrice } from '@/lib/utils/formatters'
import type { WarehouseDto } from '@/lib/types/api'

interface Props {
  warehouse: WarehouseDto
}

export function WarehouseSlabSummary({ warehouse: w }: Props) {
  const utilizationPct = w.capacitySqft && w.capacitySqft > 0
    ? Math.min(100, Math.round((w.slabCount / w.capacitySqft) * 100))
    : null

  const stats = [
    { label: 'Total Slabs', value: w.slabCount.toLocaleString(),      color: 'text-gray-900',    sub: null },
    { label: 'Available',   value: w.availableCount.toLocaleString(),  color: 'text-emerald-700', sub: null },
    { label: 'Reserved',    value: w.reservedCount.toLocaleString(),   color: 'text-blue-700',    sub: null },
    { label: 'On Hold',     value: w.onHoldCount.toLocaleString(),     color: 'text-amber-600',   sub: null },
    {
      label: 'Est. Value',
      value: w.estimatedValue != null ? formatPrice(w.estimatedValue) : '—',
      color: 'text-gray-900',
      sub:   'available slabs only',
    },
  ]

  return (
    <div className="mb-5 space-y-3">
      <div className="grid grid-cols-5 gap-3">
        {stats.map(s => (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col gap-1"
          >
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-bold leading-none ${s.color}`}>{s.value}</p>
            {s.sub && <p className="text-[10px] text-gray-400">{s.sub}</p>}
          </div>
        ))}
      </div>

      {utilizationPct !== null && (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Capacity Utilization</p>
            <p className="text-xs font-semibold text-gray-700">
              {w.slabCount} slabs · {w.capacitySqft?.toLocaleString()} sq ft capacity · {utilizationPct}%
            </p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                utilizationPct >= 90 ? 'bg-red-500' : utilizationPct >= 70 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${utilizationPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
