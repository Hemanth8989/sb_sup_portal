'use client'

import { useState } from 'react'
import Link from 'next/link'
import { use } from 'react'
import {
  ArrowLeft, MapPin, Phone, Star, PowerOff, Pencil,
  Layers, Package, AlertTriangle, ArrowRightLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useWarehouse, useSetPrimaryWarehouse, useDeactivateWarehouse } from '@/lib/hooks/useWarehouses'
import { AddWarehouseSheet } from '../_components/AddWarehouseSheet'
import { TransferSlabsModal } from './_components/TransferSlabsModal'
import { WarehouseSlabTable } from './_components/WarehouseSlabTable'
import { WarehouseProductTable } from './_components/WarehouseProductTable'
import { formatPrice } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

type Tab = 'slabs' | 'products'

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

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Skeleton className="h-5 w-52" />
        </div>
        <div className="p-6 flex flex-col gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !wh) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 bg-gray-50">
        <p className="text-sm text-muted-foreground">Warehouse not found.</p>
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

      {/* ── Topbar ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 h-14 flex items-center gap-3 shrink-0">
        <Link href="/warehouses">
          <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Warehouses
          </button>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-900">{wh.name}</span>

        {wh.isPrimary && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-700">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            Primary
          </span>
        )}
        {!wh.isActive && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-500">
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
            <Star className="w-3.5 h-3.5" />
            Set Primary
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
            <PowerOff className="w-3.5 h-3.5" />
            Deactivate
          </Button>
        )}
        <Button
          size="sm" variant="outline"
          className="h-8 text-xs gap-1.5"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Details
        </Button>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Info + KPI strip ──────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">

          {/* Location / phone */}
          <div className="flex flex-wrap items-center gap-4 mb-5">
            {location && (
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {location}
              </span>
            )}
            {wh.phone && (
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {wh.phone}
              </span>
            )}
          </div>

          {/* Unified KPI row */}
          <div className="flex items-stretch divide-x divide-gray-100">

            {/* Slab KPIs */}
            <div className="flex items-stretch divide-x divide-gray-100 pr-6">
              <div className="pr-6">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Stone Slabs
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-gray-900 leading-none">{wh.slabCount}</span>
                  <span className="text-xs text-gray-400 mb-0.5">total</span>
                </div>
              </div>

              {[
                { label: 'Available', value: wh.availableCount, color: 'text-emerald-700' },
                { label: 'Reserved',  value: wh.reservedCount,  color: 'text-blue-700'    },
                { label: 'On Hold',   value: wh.onHoldCount,    color: 'text-amber-600'   },
              ].map(k => (
                <div key={k.label} className="px-5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{k.label}</p>
                  <p className={`text-xl font-bold leading-none ${k.color}`}>{k.value}</p>
                </div>
              ))}

              <div className="pl-5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Est. Value</p>
                <p className="text-xl font-bold leading-none text-gray-900">
                  {wh.estimatedValue != null ? formatPrice(wh.estimatedValue) : '—'}
                </p>
              </div>
            </div>

            {/* Product KPIs */}
            <div className="flex items-stretch divide-x divide-gray-100 pl-6">
              <div className="pr-5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Package className="w-3 h-3" /> Products & Supplies
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-gray-900 leading-none">{wh.productSkuCount}</span>
                  <span className="text-xs text-gray-400 mb-0.5">SKUs</span>
                </div>
              </div>

              <div className="px-5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Low Stock</p>
                <p className={`text-xl font-bold leading-none flex items-center gap-1 ${
                  wh.lowStockCount > 0 ? 'text-red-600' : 'text-emerald-700'
                }`}>
                  {wh.lowStockCount > 0 && <AlertTriangle className="w-3.5 h-3.5" />}
                  {wh.lowStockCount}
                </p>
              </div>

              <div className="pl-5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Stock Value</p>
                <p className="text-xl font-bold leading-none text-gray-900">
                  {wh.productStockValue != null ? formatPrice(wh.productStockValue) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-6 flex items-center gap-0 shrink-0">
          {([
            {
              key:   'slabs' as const,
              icon:  <Layers className="w-3.5 h-3.5" />,
              label: 'Stone Slabs',
              count: wh.slabCount,
            },
            {
              key:   'products' as const,
              icon:  <Package className="w-3.5 h-3.5" />,
              label: 'Products & Supplies',
              count: wh.productSkuCount,
              alert: wh.lowStockCount,
            },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
                tab === t.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {t.icon}
              {t.label}
              {t.count > 0 && (
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                  tab === t.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500',
                )}>
                  {t.count}
                </span>
              )}
              {'alert' in t && t.alert > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">
                  {t.alert} low
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab body ─────────────────────────────────────────────────────── */}
        <div className="p-6">
          {tab === 'slabs' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Slab Inventory</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {wh.slabCount} total · {wh.availableCount} available
                  </p>
                </div>
                <Button
                  size="sm" variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => openTransfer([])}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Transfer Slabs
                </Button>
              </div>
              <div className="p-5">
                <WarehouseSlabTable warehouseId={id} onTransferRequest={openTransfer} />
              </div>
            </div>
          )}

          {tab === 'products' && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Products & Supplies</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {wh.productSkuCount} SKUs stocked
                    {wh.lowStockCount > 0 && (
                      <span className="ml-2 text-red-600 font-medium">
                        · {wh.lowStockCount} below reorder point
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="p-5">
                <WarehouseProductTable warehouseId={id} />
              </div>
            </div>
          )}
        </div>
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
