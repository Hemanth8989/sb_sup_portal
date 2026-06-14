'use client'

import { useState } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { ArrowLeft, Package2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useBundle } from '@/lib/hooks/useBundles'
import { AddBundleSheet } from '../_components/AddBundleSheet'
import { BundleSlabGrid } from './_components/BundleSlabGrid'
import { formatSqft } from '@/lib/utils/formatters'

interface Props {
  params: Promise<{ id: string }>
}

export default function BundleDetailPage({ params }: Props) {
  const { id }  = use(params)
  const { data: bundle, isPending, isError } = useBundle(id)
  const [editOpen, setEditOpen] = useState(false)

  if (isPending) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-100 px-6 py-3">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="p-6 flex flex-col gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !bundle) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <p className="text-sm text-muted-foreground">Bundle not found.</p>
        <Link href="/bundles"><Button variant="outline" size="sm">Back to Bundles</Button></Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <Link href="/bundles">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <Package2 className="w-4 h-4 text-muted-foreground" />
        <h1 className="text-sm font-semibold text-gray-900 flex-1">
          <span className="font-mono">{bundle.bundleRef}</span>
          <span className="font-normal text-muted-foreground ml-2">— {bundle.materialName}</span>
        </h1>
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>Edit bundle</Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {/* Bundle meta card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {bundle.quarryName && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Quarry</div>
                <div className="text-sm text-gray-800">{bundle.quarryName}</div>
              </div>
            )}
            {bundle.originCountry && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Origin</div>
                <div className="text-sm text-gray-800">{bundle.originCountry}</div>
              </div>
            )}
            {bundle.arrivalDate && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Arrived</div>
                <div className="text-sm text-gray-800">{bundle.arrivalDate}</div>
              </div>
            )}
            {bundle.invoiceRef && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Invoice</div>
                <div className="text-sm font-mono text-gray-800">{bundle.invoiceRef}</div>
              </div>
            )}
          </div>
          {bundle.notes && (
            <p className="text-xs text-muted-foreground italic mt-3 pt-3 border-t border-gray-50">
              {bundle.notes}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{bundle.slabCount}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Total Slabs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">{bundle.availableCount}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {bundle.totalSqftAvailable != null ? formatSqft(bundle.totalSqftAvailable) : '—'}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Sqft Avail.</div>
            </div>
            <div className="text-center flex flex-col items-center justify-center">
              {bundle.slabs.some(s => s.blockNumber) && (
                <>
                  <Layers className="w-5 h-5 text-violet-600 mb-1" />
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Pairs detected</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Slab grid */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Slabs ({bundle.slabs.length})
          </h2>
          <BundleSlabGrid slabs={bundle.slabs} />
        </div>
      </div>

      <AddBundleSheet open={editOpen} onClose={() => setEditOpen(false)} editing={bundle} />
    </div>
  )
}
