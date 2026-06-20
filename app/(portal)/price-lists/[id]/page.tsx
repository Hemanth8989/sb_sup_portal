'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Settings2, Plus, AlertTriangle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePriceList } from '@/lib/hooks/usePriceLists'
import { EditPriceListSheet } from '../_components/EditPriceListSheet'
import { AddItemsSheet }       from '../_components/AddItemsSheet'
import { PriceListItemsTable } from '../_components/PriceListItemsTable'

const TIER_COLOR: Record<string, string> = {
  standard:  'bg-gray-100 text-gray-600',
  preferred: 'bg-blue-50 text-blue-700',
  vip:       'bg-violet-50 text-violet-700',
}

function ValidityBanner({ validFrom, validTo }: { validFrom: string | null; validTo: string | null }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (validTo) {
    const to = new Date(validTo)
    if (to < today) {
      return (
        <div className="mx-6 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          This price list expired on {new Date(validTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. It is no longer visible to fabricators.
        </div>
      )
    }
  }

  if (validFrom) {
    const from = new Date(validFrom)
    if (from > today) {
      return (
        <div className="mx-6 mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700">
          <Clock className="w-4 h-4 shrink-0" />
          This price list becomes active on {new Date(validFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
        </div>
      )
    }
  }

  return null
}

export default function PriceListDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const { data: pl, isPending, isError } = usePriceList(id)

  const [editOpen, setEditOpen]     = useState(false)
  const [addOpen,  setAddOpen]      = useState(false)

  if (isPending) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !pl) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Price list not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900">{pl.name}</h1>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${TIER_COLOR[pl.tier] ?? 'bg-gray-100 text-gray-600'}`}>
          {pl.tier}
        </span>
        {!pl.isActive && (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-500">Inactive</span>
        )}

        <div className="flex-1" />

        <span className="text-xs text-muted-foreground">{pl.currency} · {pl.itemCount} item{pl.itemCount !== 1 ? 's' : ''}</span>

        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditOpen(true)}>
          <Settings2 className="w-3.5 h-3.5 mr-1.5" />
          Edit Details
        </Button>
        <Button size="sm" className="h-8 text-xs" onClick={() => setAddOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Items
        </Button>
      </div>

      {/* Validity banner */}
      <ValidityBanner validFrom={pl.validFrom} validTo={pl.validTo} />

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-6">
        <PriceListItemsTable pl={pl} />
      </div>

      {/* Sheets */}
      <EditPriceListSheet pl={pl} open={editOpen} onClose={() => setEditOpen(false)} />
      <AddItemsSheet      pl={pl} open={addOpen}  onClose={() => setAddOpen(false)} />
    </div>
  )
}
