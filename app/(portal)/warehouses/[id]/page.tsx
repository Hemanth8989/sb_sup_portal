'use client'

import { useState } from 'react'
import Link from 'next/link'
import { use } from 'react'
import {
  ArrowLeft, MapPin, Phone, Star, PowerOff, Pencil,
  Layers, Package, AlertTriangle, ArrowRightLeft, History, Download, BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useWarehouse, useSetPrimaryWarehouse, useDeactivateWarehouse } from '@/lib/hooks/useWarehouses'
import { AddWarehouseSheet } from '../_components/AddWarehouseSheet'
import { TransferSlabsModal } from './_components/TransferSlabsModal'
import { WarehouseSlabTable } from './_components/WarehouseSlabTable'
import { WarehouseProductTable } from './_components/WarehouseProductTable'
import { WarehouseSlabSummary } from './_components/WarehouseSlabSummary'
import { WarehouseProductSummary } from './_components/WarehouseProductSummary'
import { WarehouseHistory } from './_components/WarehouseHistory'
import { WarehouseBundleView } from './_components/WarehouseBundleView'
import { warehousesApi } from '@/lib/api/supplier/warehouses'
import { cn } from '@/lib/utils'

type Tab = 'slabs' | 'products' | 'bundles' | 'history'

interface Props {
  params: Promise<{ id: string }>
}

export default function WarehouseDetailPage({ params }: Props) {
  const { id } = use(params)
  const { data: wh, isPending, isError } = useWarehouse(id)
  const setPrimary = useSetPrimaryWarehouse()
  const deactivate = useDeactivateWarehouse()

  const [tab,           setTab]          = useState<Tab>('slabs')
  const [editOpen,      setEditOpen]     = useState(false)
  const [transferOpen,  setTransferOpen] = useState(false)
  const [transferSlabs, setTransferSlabs] = useState<string[]>([])

  function openTransfer(ids: string[]) {
    setTransferSlabs(ids)
    setTransferOpen(true)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 h-14 flex items-center">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !wh) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 bg-gray-50">
        <p className="text-sm text-gray-500">Warehouse not found.</p>
        <Link href="/warehouses">
          <Button variant="outline" size="sm">← Back to Warehouses</Button>
        </Link>
      </div>
    )
  }

  const location = [wh.addressLine1, wh.city, wh.stateProvince, wh.postalCode, wh.country]
    .filter(Boolean).join(', ')

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 h-14 flex items-center gap-3 shrink-0">
        <Link href="/warehouses">
          <button className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Warehouses
          </button>
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-sm font-semibold text-gray-900">{wh.name}</span>

        {wh.isPrimary && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-700">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            Primary
          </span>
        )}
        {!wh.isActive && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-400">
            Inactive
          </span>
        )}

        <div className="flex-1" />

        {!wh.isPrimary && wh.isActive && (
          <Button
            size="sm" variant="outline"
            className="h-8 text-xs gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
            disabled={setPrimary.isPending}
            onClick={() => setPrimary.mutate(id)}
          >
            <Star className="w-3.5 h-3.5" /> Set Primary
          </Button>
        )}
        {wh.isActive && (
          <Button
            size="sm" variant="outline"
            className="h-8 text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
            disabled={deactivate.isPending}
            onClick={() => {
              if (confirm('Deactivate this warehouse? All inventory data will be preserved.')) {
                deactivate.mutate(id)
              }
            }}
          >
            <PowerOff className="w-3.5 h-3.5" /> Deactivate
          </Button>
        )}
        <Button
          size="sm" variant="outline"
          className="h-8 text-xs gap-1.5"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="w-3.5 h-3.5" /> Edit Details
        </Button>
      </div>

      {/* ── Location strip ─────────────────────────────────────────────────── */}
      {(location || wh.phone) && (
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-5 shrink-0">
          {location && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {location}
            </span>
          )}
          {wh.phone && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {wh.phone}
            </span>
          )}
        </div>
      )}

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 flex items-center shrink-0">
        <button
          onClick={() => setTab('slabs')}
          className={cn(
            'flex items-center gap-2 px-1 py-3 mr-6 text-xs font-medium border-b-2 transition-colors',
            tab === 'slabs'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-400 hover:text-gray-700',
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          Stone Slabs
          <span className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-semibold',
            tab === 'slabs' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500',
          )}>
            {wh.slabCount}
          </span>
        </button>

        <button
          onClick={() => setTab('products')}
          className={cn(
            'flex items-center gap-2 px-1 py-3 mr-6 text-xs font-medium border-b-2 transition-colors',
            tab === 'products'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-400 hover:text-gray-700',
          )}
        >
          <Package className="w-3.5 h-3.5" />
          Products & Supplies
          <span className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-semibold',
            tab === 'products' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500',
          )}>
            {wh.productSkuCount}
          </span>
          {wh.lowStockCount > 0 && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">
              <AlertTriangle className="w-2.5 h-2.5" />
              {wh.lowStockCount} low
            </span>
          )}
        </button>

        <button
          onClick={() => setTab('bundles')}
          className={cn(
            'flex items-center gap-2 px-1 py-3 mr-6 text-xs font-medium border-b-2 transition-colors',
            tab === 'bundles'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-400 hover:text-gray-700',
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Bundles &amp; Lots
        </button>

        <button
          onClick={() => setTab('history')}
          className={cn(
            'flex items-center gap-2 px-1 py-3 text-xs font-medium border-b-2 transition-colors',
            tab === 'history'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-400 hover:text-gray-700',
          )}
        >
          <History className="w-3.5 h-3.5" />
          History
        </button>
      </div>

      {/* ── Tab body ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* ── Slabs tab ──────────────────────────────────────────────────── */}
        {tab === 'slabs' && (
          <>
            <WarehouseSlabSummary warehouse={wh} />

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Slab Inventory</h2>
                <div className="flex items-center gap-2">
                  <a
                    href={warehousesApi.exportSlabs(id)}
                    download={`warehouse-slabs-${id}.csv`}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </a>
                  <Button
                    size="sm" variant="outline"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => openTransfer([])}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Transfer Slabs
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <WarehouseSlabTable warehouseId={id} onTransferRequest={openTransfer} />
              </div>
            </div>
          </>
        )}

        {/* ── Products tab ───────────────────────────────────────────────── */}
        {tab === 'products' && (
          <>
            <WarehouseProductSummary warehouse={wh} />

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Products & Supplies</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Stock levels tracked per warehouse. Use "Receive Stock" to add inventory.
                </p>
              </div>
              <div className="p-5">
                <WarehouseProductTable warehouseId={id} />
              </div>
            </div>
          </>
        )}
        {/* ── Bundles tab ────────────────────────────────────────────────── */}
        {tab === 'bundles' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Bundles &amp; Lots</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Slabs grouped by quarry bundle or lot number. Useful for identifying bookmatched sets.
              </p>
            </div>
            <div className="p-5">
              <WarehouseBundleView warehouseId={id} />
            </div>
          </div>
        )}

        {/* ── History tab ────────────────────────────────────────────────── */}
        {tab === 'history' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Activity History</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                All slab transfers, status changes, and product stock movements for this warehouse.
              </p>
            </div>
            <div className="p-5">
              <WarehouseHistory warehouseId={id} />
            </div>
          </div>
        )}
      </div>

      <AddWarehouseSheet open={editOpen} onClose={() => setEditOpen(false)} editing={wh} />
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
