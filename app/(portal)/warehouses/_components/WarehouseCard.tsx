'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Star, Package, ArrowRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatPrice } from '@/lib/utils/formatters'
import type { WarehouseDto } from '@/lib/types/api'
import { useSetPrimaryWarehouse, useDeactivateWarehouse } from '@/lib/hooks/useWarehouses'

interface Props {
  warehouse: WarehouseDto
  onEdit: (warehouse: WarehouseDto) => void
}

export function WarehouseCard({ warehouse: w, onEdit }: Props) {
  const setPrimary  = useSetPrimaryWarehouse()
  const deactivate  = useDeactivateWarehouse()
  const [confirming, setConfirming] = useState(false)

  const location = [w.city, w.stateProvince, w.country].filter(Boolean).join(', ')

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4 hover:border-gray-200 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100">
          <Package className="w-5 h-5 text-stone-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{w.name}</h3>
            {w.isPrimary && (
              <Badge variant="secondary" className="text-[10px] gap-0.5 py-0.5">
                <Star className="w-2.5 h-2.5" /> Primary
              </Badge>
            )}
          </div>
          {location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {location}
            </p>
          )}
          {w.phone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" /> {w.phone}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(w)}>
              <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
            </DropdownMenuItem>
            {!w.isPrimary && (
              <DropdownMenuItem onClick={() => setPrimary.mutate(w.id)}>
                <Star className="w-3.5 h-3.5 mr-2" /> Set as primary
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {confirming ? (
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => deactivate.mutate(w.id)}
              >
                Confirm deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Deactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center py-2 rounded-lg bg-gray-50">
          <div className="text-base font-bold text-gray-900">{w.availableCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Available</div>
        </div>
        <div className="text-center py-2 rounded-lg bg-amber-50">
          <div className="text-base font-bold text-amber-700">{w.reservedCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Reserved</div>
        </div>
        <div className="text-center py-2 rounded-lg bg-blue-50">
          <div className="text-base font-bold text-blue-700">{w.onHoldCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">On Hold</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Est. Value</div>
          <div className="text-sm font-semibold text-gray-900">
            {w.estimatedValue != null ? formatPrice(w.estimatedValue) : '—'}
          </div>
        </div>
        <Link href={`/warehouses/${w.id}`}>
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            View slabs <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
