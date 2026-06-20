'use client'

import { useState } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { ArrowLeft, MapPin, Phone, Star, ArrowRightLeft, PowerOff, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useWarehouse, useSetPrimaryWarehouse, useDeactivateWarehouse } from '@/lib/hooks/useWarehouses'
import { AddWarehouseSheet } from '../_components/AddWarehouseSheet'
import { TransferSlabsModal } from './_components/TransferSlabsModal'
import { WarehouseSlabTable } from './_components/WarehouseSlabTable'
import { formatPrice } from '@/lib/utils/formatters'

interface Props {
  params: Promise<{ id: string }>
}

export default function WarehouseDetailPage({ params }: Props) {
  const { id } = use(params)
  const { data: warehouse, isPending, isError } = useWarehouse(id)
  const setPrimary = useSetPrimaryWarehouse()
  const deactivate = useDeactivateWarehouse()

  const [editOpen,      setEditOpen]      = useState(false)
  const [transferOpen,  setTransferOpen]  = useState(false)
  const [transferSlabs, setTransferSlabs] = useState<string[]>([])

  function openTransfer(ids: string[]) {
    setTransferSlabs(ids)
    setTransferOpen(true)
  }

  if (isPending) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-100 px-6 py-3">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="p-6 flex flex-col gap-4">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
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
        <h1 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          {warehouse.name}
          {warehouse.isPrimary && (
            <Badge variant="secondary" className="text-[10px] gap-0.5">
              <Star className="w-2.5 h-2.5" /> Primary
            </Badge>
          )}
          {!warehouse.isActive && (
            <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-500">Inactive</Badge>
          )}
        </h1>
        <div className="flex-1" />

        {!warehouse.isPrimary && warehouse.isActive && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-yellow-700 border-yellow-200"
            disabled={setPrimary.isPending}
            onClick={() => setPrimary.mutate(id)}
          >
            <Star className="w-3.5 h-3.5" />
            Set Primary
          </Button>
        )}
        {warehouse.isActive && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-red-500"
            disabled={deactivate.isPending}
            onClick={() => {
              if (confirm('Deactivate this warehouse? Slabs will remain but it will be hidden from filters.')) {
                deactivate.mutate(id)
              }
            }}
          >
            <PowerOff className="w-3.5 h-3.5" />
            Deactivate
          </Button>
        )}
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditOpen(true)}>
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </Button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

        {/* Details + KPIs card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          {/* Address / phone */}
          <div className="flex flex-wrap gap-6">
            {location && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Location</div>
                  <div className="text-sm text-gray-800">{location}</div>
                </div>
              </div>
            )}
            {warehouse.phone && (
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Phone</div>
                  <div className="text-sm text-gray-800">{warehouse.phone}</div>
                </div>
              </div>
            )}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-5 gap-3 mt-5 pt-5 border-t border-gray-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{warehouse.slabCount}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Total Slabs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">{warehouse.availableCount}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{warehouse.reservedCount}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Reserved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{warehouse.onHoldCount}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">On Hold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {warehouse.estimatedValue != null ? formatPrice(warehouse.estimatedValue) : '—'}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Est. Value</div>
            </div>
          </div>
        </div>

        {/* Slab inventory — inline */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Slab Inventory
            </h2>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-7 text-xs"
              onClick={() => openTransfer([])}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Transfer Slabs
            </Button>
          </div>
          <WarehouseSlabTable warehouseId={id} onTransferRequest={openTransfer} />
        </div>
      </div>

      <AddWarehouseSheet open={editOpen} onClose={() => setEditOpen(false)} editing={warehouse} />
      <TransferSlabsModal
        open={transferOpen}
        onClose={() => { setTransferOpen(false); setTransferSlabs([]) }}
        warehouseId={id}
        selectedSlabIds={transferSlabs}
        onSuccess={() => setTransferSlabs([])}
      />
    </div>
  )
}
