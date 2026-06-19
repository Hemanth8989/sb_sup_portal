'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePriceLists, useDeletePriceList } from '@/lib/hooks/usePriceLists'
import { AddPriceListSheet } from './_components/AddPriceListSheet'

const TIER_COLOR: Record<string, string> = {
  standard:  'bg-gray-100 text-gray-600',
  preferred: 'bg-blue-50 text-blue-700',
  vip:       'bg-violet-50 text-violet-700',
}

export default function PriceListsPage() {
  const router = useRouter()
  const { data, isPending, isError } = usePriceLists()
  const deletePl = useDeletePriceList()
  const [sheetOpen, setSheetOpen] = useState(false)

  const priceLists = data ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <h1 className="text-sm font-semibold text-gray-900">Price Lists</h1>
        <div className="flex-1" />
        <Button size="sm" onClick={() => setSheetOpen(true)}>
          <Plus className="w-4 h-4" />
          New Price List
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isPending && (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-muted-foreground">Failed to load price lists.</p>
          </div>
        )}

        {!isPending && !isError && priceLists.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Tag className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No price lists yet.</p>
            <Button size="sm" variant="outline" onClick={() => setSheetOpen(true)}>Create your first</Button>
          </div>
        )}

        {priceLists.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {priceLists.map(pl => (
              <div
                key={pl.id}
                className="border border-gray-100 rounded-lg bg-white p-5 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => router.push(`/price-lists/${pl.id}`)}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm font-medium text-gray-900 leading-snug">{pl.name}</h3>
                  <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${TIER_COLOR[pl.tier] ?? 'bg-gray-100 text-gray-600'}`}>
                    {pl.tier}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <span>{pl.itemCount} item{pl.itemCount !== 1 ? 's' : ''}</span>
                  <span>{pl.currency}</span>
                  {!pl.isActive && <span className="text-red-500">Inactive</span>}
                </div>
                <div className="mt-3 flex gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1"
                    onClick={e => { e.stopPropagation(); router.push(`/price-lists/${pl.id}`) }}
                  >Edit Items</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500"
                    disabled={deletePl.isPending}
                    onClick={e => { e.stopPropagation(); deletePl.mutate(pl.id) }}
                  >Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddPriceListSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
