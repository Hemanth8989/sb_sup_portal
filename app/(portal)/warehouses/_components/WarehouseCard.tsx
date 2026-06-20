'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin, Phone, Star, MoreHorizontal, Pencil, Trash2,
  Layers, Package, AlertTriangle, ChevronRight,
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatPrice } from '@/lib/utils/formatters'
import type { WarehouseDto } from '@/lib/types/api'
import { useSetPrimaryWarehouse, useDeactivateWarehouse } from '@/lib/hooks/useWarehouses'
import { cn } from '@/lib/utils'

interface Props {
  warehouse: WarehouseDto
  onEdit: (warehouse: WarehouseDto) => void
}

export function WarehouseCard({ warehouse: w, onEdit }: Props) {
  const setPrimary  = useSetPrimaryWarehouse()
  const deactivate  = useDeactivateWarehouse()
  const [confirming, setConfirming] = useState(false)

  const location = [w.city, w.stateProvince].filter(Boolean).join(', ')

  return (
    <div className={cn(
      'bg-white rounded-xl border flex flex-col transition-shadow hover:shadow-sm',
      w.isPrimary ? 'border-amber-200' : 'border-gray-200',
    )}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start gap-3 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{w.name}</h3>
            {w.isPrimary && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-700 shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> Primary
              </span>
            )}
            {!w.isActive && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-400 shrink-0">
                Inactive
              </span>
            )}
          </div>
          {location && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" /> {location}
            </p>
          )}
          {w.phone && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 shrink-0" /> {w.phone}
            </p>
          )}
        </div>

        <DropdownMenu onOpenChange={open => { if (!open) { setConfirming(false) } }}>
          <DropdownMenuTrigger className="h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(w)} className="gap-2 text-[13px]">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </DropdownMenuItem>
            {!w.isPrimary && w.isActive && (
              <DropdownMenuItem onClick={() => setPrimary.mutate(w.id)} className="gap-2 text-[13px]">
                <Star className="w-3.5 h-3.5" /> Set as Primary
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {confirming
              ? (
                  <DropdownMenuItem
                    className="gap-2 text-[13px] text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => deactivate.mutate(w.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Confirm deactivate
                  </DropdownMenuItem>
                )
              : (
                  <DropdownMenuItem
                    className="gap-2 text-[13px] text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => setConfirming(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Deactivate
                  </DropdownMenuItem>
                )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 flex flex-col gap-3">
        {/* Slabs row */}
        <div className="flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-20">Slabs</span>
          <div className="flex items-center gap-3 ml-1">
            <div className="text-center">
              <span className="text-sm font-bold text-emerald-700">{w.availableCount}</span>
              <span className="text-[10px] text-gray-400 ml-1">avail</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-blue-700">{w.reservedCount}</span>
              <span className="text-[10px] text-gray-400 ml-1">rsv</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-amber-600">{w.onHoldCount}</span>
              <span className="text-[10px] text-gray-400 ml-1">hold</span>
            </div>
          </div>
          <div className="flex-1" />
          <span className="text-xs font-semibold text-gray-700">
            {w.estimatedValue != null ? formatPrice(w.estimatedValue) : '—'}
          </span>
        </div>

        {/* Products row */}
        <div className="flex items-center gap-1.5">
          <Package className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-20">Products</span>
          <span className="text-sm font-bold text-gray-700 ml-1">{w.productSkuCount}</span>
          <span className="text-[10px] text-gray-400 ml-1">SKUs</span>
          {w.lowStockCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-600">
              <AlertTriangle className="w-2.5 h-2.5" /> {w.lowStockCount} low
            </span>
          )}
          <div className="flex-1" />
          {w.productStockValue != null && (
            <span className="text-xs font-semibold text-gray-700">{formatPrice(w.productStockValue)}</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 mt-auto">
        <Link
          href={`/warehouses/${w.id}`}
          className="flex items-center justify-between text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <span>View warehouse</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 transition-colors" />
        </Link>
      </div>
    </div>
  )
}
