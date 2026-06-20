'use client'

import { AlertTriangle } from 'lucide-react'
import { formatPrice } from '@/lib/utils/formatters'
import type { WarehouseDto } from '@/lib/types/api'

interface Props {
  warehouse: WarehouseDto
}

export function WarehouseProductSummary({ warehouse }: Props) {
  const stats = [
    {
      label: 'SKUs Stocked',
      value: warehouse.productSkuCount.toLocaleString(),
      color: 'text-gray-900',
      sub:   'distinct product variants',
      alert: false,
    },
    {
      label: 'Low Stock',
      value: warehouse.lowStockCount.toLocaleString(),
      color: warehouse.lowStockCount > 0 ? 'text-red-600' : 'text-emerald-700',
      sub:   warehouse.lowStockCount > 0 ? 'below reorder point' : 'all above threshold',
      alert: warehouse.lowStockCount > 0,
    },
    {
      label: 'Stock Value',
      value: warehouse.productStockValue != null ? formatPrice(warehouse.productStockValue) : '—',
      color: 'text-gray-900',
      sub:   'on-hand qty × unit price',
      alert: false,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {stats.map(s => (
        <div
          key={s.label}
          className={`bg-white border rounded-xl px-4 py-3 flex flex-col gap-1 ${
            s.alert ? 'border-red-200 bg-red-50/40' : 'border-gray-200'
          }`}
        >
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            {s.alert && <AlertTriangle className="w-3 h-3 text-red-500" />}
            {s.label}
          </p>
          <p className={`text-2xl font-bold leading-none ${s.color}`}>{s.value}</p>
          <p className="text-[10px] text-gray-400">{s.sub}</p>
        </div>
      ))}
    </div>
  )
}
