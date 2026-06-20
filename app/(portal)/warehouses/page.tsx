'use client'

import { useState } from 'react'
import { Plus, Warehouse, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { WarehouseCard } from './_components/WarehouseCard'
import { AddWarehouseSheet } from './_components/AddWarehouseSheet'
import { useWarehouses } from '@/lib/hooks/useWarehouses'
import type { WarehouseDto } from '@/lib/types/api'

export default function WarehousesPage() {
  const { data: warehouses, isPending, isError } = useWarehouses()
  const [sheetOpen, setSheetOpen]   = useState(false)
  const [editing, setEditing]       = useState<WarehouseDto | null>(null)

  const openAdd  = () => { setEditing(null); setSheetOpen(true) }
  const openEdit = (w: WarehouseDto) => { setEditing(w); setSheetOpen(true) }
  const close    = () => { setSheetOpen(false); setEditing(null) }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2 shrink-0">
        <h1 className="text-sm font-semibold text-gray-900 flex-1">Warehouses</h1>
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Add Warehouse
        </Button>
      </div>

      {/* Low-stock alert banner */}
      {warehouses && warehouses.reduce((n, w) => n + w.lowStockCount, 0) > 0 && (() => {
        const total = warehouses.reduce((n, w) => n + w.lowStockCount, 0)
        const whCount = warehouses.filter(w => w.lowStockCount > 0).length
        return (
          <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-red-700 font-medium">
              {total} SKU{total !== 1 ? 's' : ''} below reorder point
              {' '}across {whCount} warehouse{whCount !== 1 ? 's' : ''}.
            </p>
            <p className="text-red-500 text-xs">Open a warehouse and go to Products &amp; Supplies to restock.</p>
          </div>
        )
      })()}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isPending && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-sm text-muted-foreground">Failed to load warehouses.</p>
          </div>
        )}

        {warehouses?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <div className="w-14 h-14 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100">
              <Warehouse className="w-7 h-7 text-stone-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">No warehouses yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Add your first warehouse to start organizing your inventory by location.
            </p>
            <Button size="sm" onClick={openAdd}>
              <Plus className="w-4 h-4" /> Add Warehouse
            </Button>
          </div>
        )}

        {warehouses && warehouses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map(w => (
              <WarehouseCard key={w.id} warehouse={w} onEdit={openEdit} />
            ))}
          </div>
        )}
      </div>

      <AddWarehouseSheet open={sheetOpen} onClose={close} editing={editing} />
    </div>
  )
}
