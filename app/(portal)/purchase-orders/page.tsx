'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePurchaseOrders } from '@/lib/hooks/usePurchaseOrders'

const STATUS_TABS = [
  { label: 'All',          value: undefined },
  { label: 'Sent',         value: 'sent' },
  { label: 'Acknowledged', value: 'acknowledged' },
  { label: 'Shipped',      value: 'shipped' },
  { label: 'Received',     value: 'received' },
  { label: 'Cancelled',    value: 'cancelled' },
]

const STATUS_COLOR: Record<string, string> = {
  draft:            'bg-gray-100 text-gray-600',
  sent:             'bg-blue-50 text-blue-700',
  acknowledged:     'bg-indigo-50 text-indigo-700',
  partially_acked:  'bg-yellow-50 text-yellow-700',
  countered:        'bg-orange-50 text-orange-700',
  confirmed:        'bg-teal-50 text-teal-700',
  shipped:          'bg-violet-50 text-violet-700',
  received:         'bg-green-50 text-green-700',
  closed:           'bg-gray-100 text-gray-500',
  disputed:         'bg-red-50 text-red-600',
  cancelled:        'bg-red-50 text-red-400',
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)
  const { data, isPending, isError } = usePurchaseOrders({ status: activeTab })

  const orders = data?.items ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <h1 className="text-sm font-semibold text-gray-900">Purchase Orders</h1>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">{data?.totalCount ?? 0} orders</span>
      </div>

      {/* Status tabs */}
      <div className="bg-white border-b border-gray-100 px-6 flex gap-1 shrink-0">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-muted-foreground hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isPending && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-muted-foreground">Failed to load purchase orders.</p>
          </div>
        )}

        {!isPending && !isError && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Package className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No purchase orders found.</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="border border-gray-100 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">PO Number</th>
                  <th className="text-left px-4 py-2 font-medium">Fabricator</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium">Total</th>
                  <th className="text-left px-4 py-2 font-medium">Delivery</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(po => (
                  <tr
                    key={po.id}
                    className="hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => router.push(`/purchase-orders/${po.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium">{po.poNumber}</td>
                    <td className="px-4 py-3 text-gray-700">{po.fabricatorName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_COLOR[po.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {po.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {po.currency} {po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {po.requestedDelivery ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">View</Button>
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
