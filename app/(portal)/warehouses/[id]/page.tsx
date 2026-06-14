'use client'

import { useState } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { ArrowLeft, MapPin, Phone, Star, Package, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useWarehouse } from '@/lib/hooks/useWarehouses'
import { AddWarehouseSheet } from '../_components/AddWarehouseSheet'
import { TransferSlabsModal } from './_components/TransferSlabsModal'
import { formatPrice } from '@/lib/utils/formatters'

interface Props {
  params: Promise<{ id: string }>
}

export default function WarehouseDetailPage({ params }: Props) {
  const { id } = use(params)
  const { data: warehouse, isPending, isError } = useWarehouse(id)
  const [editOpen, setEditOpen]       = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [selected, setSelected]       = useState<string[]>([])

  if (isPending) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-100 px-6 py-3">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="p-6 flex flex-col gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !warehouse) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <p className="text-sm text-muted-foreground">Warehouse not found.</p>
        <Link href="/warehouses"><Button variant="outline" size="sm">Back to Warehouses</Button></Link>
      </div>
    )
  }

  const location = [warehouse.addressLine1, warehouse.city, warehouse.stateProvince, warehouse.postalCode, warehouse.country]
    .filter(Boolean).join(', ')

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <Link href="/warehouses">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-sm font-semibold text-gray-900 flex-1 flex items-center gap-2">
          {warehouse.name}
          {warehouse.isPrimary && (
            <Badge variant="secondary" className="text-[10px] gap-0.5">
              <Star className="w-2.5 h-2.5" /> Primary
            </Badge>
          )}
        </h1>
        {selected.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfer {selected.length} slab{selected.length !== 1 ? 's' : ''}
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>Edit</Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {/* Info card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex flex-wrap gap-6">
            {location && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Location</div>
                  <div className="text-sm text-gray-800">{location}</div>
                </div>
              </div>
            )}
            {warehouse.phone && (
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Phone</div>
                  <div className="text-sm text-gray-800">{warehouse.phone}</div>
                </div>
              </div>
            )}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{warehouse.slabCount}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Total Slabs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">{warehouse.availableCount}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-700">{warehouse.reservedCount}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Reserved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {warehouse.estimatedValue != null ? formatPrice(warehouse.estimatedValue) : '—'}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Est. Value</div>
            </div>
          </div>
        </div>

        {/* Slabs placeholder — links to inventory filtered by this warehouse */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium text-gray-800">Slab inventory</div>
              <div className="text-xs text-muted-foreground">
                View and manage all slabs stored in this warehouse
              </div>
            </div>
          </div>
          <Link href={`/inventory?warehouseId=${id}`}>
            <Button variant="outline" size="sm">View in Inventory</Button>
          </Link>
        </div>
      </div>

      <AddWarehouseSheet open={editOpen} onClose={() => setEditOpen(false)} editing={warehouse} />
      <TransferSlabsModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        warehouseId={id}
        selectedSlabIds={selected}
        onSuccess={() => setSelected([])}
      />
    </div>
  )
}
