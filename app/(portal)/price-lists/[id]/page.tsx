'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePriceList, useRemovePriceListItem } from '@/lib/hooks/usePriceLists'

const TIER_COLOR: Record<string, string> = {
  standard:  'bg-gray-100 text-gray-600',
  preferred: 'bg-blue-50 text-blue-700',
  vip:       'bg-violet-50 text-violet-700',
}

export default function PriceListDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const router   = useRouter()
  const { data: pl, isPending, isError } = usePriceList(id)
  const removeItem = useRemovePriceListItem()

  if (isPending) return (
    <div className="p-6 flex flex-col gap-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-64" />
    </div>
  )

  if (isError || !pl) return (
    <div className="p-6 flex items-center justify-center h-48">
      <p className="text-sm text-muted-foreground">Price list not found.</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-gray-900">
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
        <span className="text-xs text-muted-foreground">{pl.currency} · {pl.itemCount} items</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {pl.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 border border-dashed border-gray-200 rounded-lg">
            <Plus className="w-6 h-6 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No items yet. Add products to this price list.</p>
          </div>
        ) : (
          <div className="border border-gray-100 rounded-lg bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Product Variant</th>
                  <th className="text-left px-4 py-2 font-medium">SKU</th>
                  <th className="text-right px-4 py-2 font-medium">Unit Price</th>
                  <th className="text-right px-4 py-2 font-medium">Currency</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pl.items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-medium">{item.variantName}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{item.sku}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{item.currency}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                        disabled={removeItem.isPending}
                        onClick={() => removeItem.mutate({ id, itemId: item.id })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
