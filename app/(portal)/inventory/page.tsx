'use client'

import { useState } from 'react'
import { Download, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { KpiCards } from './_components/KpiCards'
import { InventoryFilters } from './_components/InventoryFilters'
import { InventoryTable } from './_components/InventoryTable'
import { ProductInventoryTable } from './_components/ProductInventoryTable'
import { ProductKpiCards } from './_components/ProductKpiCards'
import { AddProductSheet } from './_components/AddProductSheet'
import { AddSlabSheet } from './_components/AddSlabSheet'
import { useProductInventory } from '@/lib/hooks/useProductInventory'
import { useDebounce } from '@/lib/hooks/useDebounce'
import type { ProductInventoryDto } from '@/lib/types/api'

const CATEGORY_OPTIONS = [
  { code: '',                      label: 'All Categories' },
  { code: 'sink',                  label: 'Sinks' },
  { code: 'blade',                 label: 'Blades' },
  { code: 'bit',                   label: 'Router Bits' },
  { code: 'wheel',                 label: 'Grinding Wheels' },
  { code: 'pad',                   label: 'Polishing Pads' },
  { code: 'adhesive',              label: 'Adhesives' },
  { code: 'sealer',                label: 'Sealers' },
  { code: 'cleaner',               label: 'Cleaners' },
  { code: 'edge_profile_template', label: 'Edge Templates' },
  { code: 'backsplash_tile',       label: 'Tile' },
  { code: 'trim',                  label: 'Trim / Molding' },
  { code: 'tool',                  label: 'Hand Tools' },
  { code: 'equipment',             label: 'Equipment' },
  { code: 'other',                 label: 'Other' },
]

export default function InventoryPage() {
  const [tab, setTab]         = useState<'slabs' | 'products'>('slabs')
  const [slabSheetOpen, setSlabSheetOpen] = useState(false)

  // Products tab state
  const [search, setSearch]               = useState('')
  const [categoryCode, setCategoryCode]   = useState('')
  const debouncedSearch                   = useDebounce(search, 300)
  const [productSheetOpen, setProductSheetOpen] = useState(false)
  const [editingProduct, setEditingProduct]      = useState<ProductInventoryDto | null>(null)

  const { data, isPending, isError } = useProductInventory({
    search:       debouncedSearch || undefined,
    categoryCode: categoryCode || undefined,
  })
  const products = data?.items ?? []

  const openAddProduct  = () => { setEditingProduct(null); setProductSheetOpen(true) }
  const openEditProduct = (p: ProductInventoryDto) => { setEditingProduct(p); setProductSheetOpen(true) }
  const closeProductSheet = () => { setProductSheetOpen(false); setEditingProduct(null) }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2 shrink-0">
        <h1 className="text-sm font-semibold text-gray-900">Inventory</h1>
        <div className="flex-1" />
        {tab === 'slabs' ? (
          <>
            <Button variant="outline" size="sm"><Download className="w-4 h-4" />Export</Button>
            <Button size="sm" onClick={() => setSlabSheetOpen(true)}>
              <Plus className="w-4 h-4" />Add Slab
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={openAddProduct}><Plus className="w-4 h-4" />Add Product</Button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="bg-white border-b border-gray-100 px-6 flex gap-1 shrink-0">
        {(['slabs', 'products'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-muted-foreground hover:text-gray-700'
            }`}
          >
            {t === 'slabs' ? 'Stone Slabs' : 'Products & Supplies'}
          </button>
        ))}
      </div>

      {/* ── SLABS TAB ─────────────────────────────────────────── */}
      {tab === 'slabs' && (
        <>
          <KpiCards />
          <InventoryFilters />
          <InventoryTable />
        </>
      )}

      {/* ── PRODUCTS TAB ──────────────────────────────────────── */}
      {tab === 'products' && (
        <>
          {!isPending && !isError && <ProductKpiCards products={products} />}

          <div className="bg-white border-b border-gray-100 px-6 py-2 flex items-center gap-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products…"
                className="pl-8 h-8 text-sm w-56"
              />
            </div>
            <select
              value={categoryCode}
              onChange={e => setCategoryCode(e.target.value)}
              className="border rounded px-2 h-8 text-xs bg-white text-gray-700"
            >
              {CATEGORY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
            <div className="flex-1" />
            {data && <span className="text-xs text-muted-foreground">{data.totalCount} product{data.totalCount !== 1 ? 's' : ''}</span>}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isPending && <div className="flex flex-col gap-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>}
            {isError && <div className="flex items-center justify-center h-48"><p className="text-sm text-muted-foreground">Failed to load products.</p></div>}
            {!isPending && !isError && <ProductInventoryTable products={products} onEdit={openEditProduct} />}
          </div>

          <AddProductSheet open={productSheetOpen} onClose={closeProductSheet} editing={editingProduct} />
        </>
      )}

      <AddSlabSheet open={slabSheetOpen} onClose={() => setSlabSheetOpen(false)} />
    </div>
  )
}
