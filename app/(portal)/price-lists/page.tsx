'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Tag, Copy, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePriceLists, useDeletePriceList, useClonePriceList } from '@/lib/hooks/usePriceLists'
import { AddPriceListSheet } from './_components/AddPriceListSheet'
import type { PriceListDto } from '@/lib/types/api'

const TIER_COLOR: Record<string, string> = {
  standard:  'bg-gray-100 text-gray-600',
  preferred: 'bg-blue-50 text-blue-700',
  vip:       'bg-violet-50 text-violet-700',
}

function CloneDialog({ pl, onClose }: { pl: PriceListDto; onClose: () => void }) {
  const [name, setName] = useState(`${pl.name} (Copy)`)
  const clone = useClonePriceList()
  const router = useRouter()

  function handleClone() {
    clone.mutate(
      { id: pl.id, name },
      {
        onSuccess: cloned => {
          onClose()
          router.push(`/price-lists/${cloned.id}`)
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl p-6 w-96" onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Clone Price List</h2>
        <p className="text-xs text-muted-foreground mb-4">All items and prices from "{pl.name}" will be copied.</p>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4"
          placeholder="New price list name"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!name.trim() || clone.isPending} onClick={handleClone}>
            {clone.isPending ? 'Cloning…' : 'Clone'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PriceListsPage() {
  const router    = useRouter()
  const { data, isPending, isError } = usePriceLists()
  const deletePl  = useDeletePriceList()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [cloning, setCloning]     = useState<PriceListDto | null>(null)

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
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)}
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
                className="border border-gray-100 rounded-xl bg-white p-5 hover:shadow-sm transition-shadow cursor-pointer group"
                onClick={() => router.push(`/price-lists/${pl.id}`)}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm font-medium text-gray-900 leading-snug">{pl.name}</h3>
                  <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${TIER_COLOR[pl.tier] ?? 'bg-gray-100 text-gray-600'}`}>
                    {pl.tier}
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-4">
                  <span>{pl.itemCount} item{pl.itemCount !== 1 ? 's' : ''}</span>
                  <span>{pl.currency}</span>
                  {pl.validFrom && <span>From {pl.validFrom}</span>}
                  {pl.validTo   && <span>Until {pl.validTo}</span>}
                  {!pl.isActive && <span className="text-red-500 font-medium">Inactive</span>}
                </div>

                <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                  <Button
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={() => router.push(`/price-lists/${pl.id}`)}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit Items
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs px-2"
                    title="Clone"
                    onClick={() => setCloning(pl)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-red-500 hover:text-red-700 px-2"
                    disabled={deletePl.isPending}
                    onClick={() => deletePl.mutate(pl.id)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddPriceListSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      {cloning && (
        <CloneDialog pl={cloning} onClose={() => setCloning(null)} />
      )}
    </div>
  )
}
