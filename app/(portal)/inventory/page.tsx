import { Suspense } from 'react'
import { Download, Upload, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KpiCards } from './_components/KpiCards'
import { InventoryFilters } from './_components/InventoryFilters'
import { InventoryTable } from './_components/InventoryTable'

export const metadata = { title: 'Inventory — StoneBridge' }

export default function InventoryPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2 shrink-0">
        <h1 className="text-sm font-semibold text-gray-900 flex-1">Inventory</h1>
        <Button variant="outline" size="sm">
          <Download />
          Export
        </Button>
        <Button variant="outline" size="sm">
          <Upload />
          Import
        </Button>
        <Button size="sm">
          <Plus />
          Add Slab
        </Button>
      </div>

      <Suspense><KpiCards /></Suspense>
      <Suspense><InventoryFilters /></Suspense>
      <Suspense><InventoryTable /></Suspense>
    </div>
  )
}
