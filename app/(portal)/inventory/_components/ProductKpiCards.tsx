'use client'

import { Package, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react'
import type { ProductInventoryDto } from '@/lib/types/api'

interface Props {
  products: ProductInventoryDto[]
}

export function ProductKpiCards({ products }: Props) {
  const allVariants = products.flatMap(p => p.variants)

  const totalSkus        = allVariants.length
  const outOfStock       = allVariants.filter(v => v.qtyAvailable === 0).length
  const lowStock         = allVariants.filter(v => v.qtyAvailable > 0 && v.qtyAvailable <= 3).length
  const catalogueValue   = allVariants.reduce((s, v) => s + v.qtyAvailable * v.basePrice, 0)

  const cards = [
    {
      label: 'Total SKUs',
      value: totalSkus,
      icon:  Package,
      color: 'text-blue-600',
      bg:    'bg-blue-50',
    },
    {
      label: 'Out of Stock',
      value: outOfStock,
      icon:  AlertTriangle,
      color: outOfStock > 0 ? 'text-red-600'    : 'text-gray-400',
      bg:    outOfStock > 0 ? 'bg-red-50'        : 'bg-gray-50',
    },
    {
      label: 'Low Stock (≤3)',
      value: lowStock,
      icon:  TrendingDown,
      color: lowStock > 0  ? 'text-orange-600'  : 'text-gray-400',
      bg:    lowStock > 0  ? 'bg-orange-50'      : 'bg-gray-50',
    },
    {
      label: 'Catalogue Value',
      value: `$${catalogueValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon:  DollarSign,
      color: 'text-emerald-600',
      bg:    'bg-emerald-50',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3 px-6 py-3 shrink-0">
      {cards.map(c => (
        <div key={c.label} className="bg-white border border-gray-100 rounded-lg px-4 py-3 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
            <c.icon className={`w-4 h-4 ${c.color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="text-lg font-bold tabular-nums">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
