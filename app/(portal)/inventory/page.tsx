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
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3 shrink-0">
        <div className="flex-1">
          <h1 className="text-base font-bold text-slate-900">Inventory</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
          <Upload className="w-3.5 h-3.5" /> Import
        </Button>
        <Button size="sm" className="gap-1.5 text-xs h-8 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-3.5 h-3.5" /> Add Slab
        </Button>
      </div>

      {/* KPI cards */}
      <Suspense>
        <KpiCards />
      </Suspense>

      {/* Filters */}
      <Suspense>
        <InventoryFilters />
      </Suspense>

      {/* Table */}
      <Suspense>
        <InventoryTable />
      </Suspense>
    </div>
  )
}
