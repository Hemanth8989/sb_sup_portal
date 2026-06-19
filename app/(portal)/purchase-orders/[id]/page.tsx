'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Truck, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePurchaseOrder, useAcknowledgePo, useShipPo } from '@/lib/hooks/usePurchaseOrders'

const STATUS_COLOR: Record<string, string> = {
  sent:          'bg-blue-50 text-blue-700',
  acknowledged:  'bg-indigo-50 text-indigo-700',
  shipped:       'bg-violet-50 text-violet-700',
  received:      'bg-green-50 text-green-700',
}

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const { data: po, isPending, isError } = usePurchaseOrder(id)
  const ack     = useAcknowledgePo()
  const ship    = useShipPo()
  const [trackingInput, setTrackingInput] = useState('')

  if (isPending) return (
    <div className="p-6 flex flex-col gap-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-40" />
    </div>
  )

  if (isError || !po) return (
    <div className="p-6 flex items-center justify-center h-48">
      <p className="text-sm text-muted-foreground">Purchase order not found.</p>
    </div>
  )

  const canAck  = po.status === 'sent'
  const canShip = po.status === 'acknowledged' || po.status === 'confirmed'

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900 font-mono">{po.poNumber}</h1>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_COLOR[po.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {po.status.replace(/_/g, ' ')}
        </span>
        <div className="flex-1" />
        {canAck && (
          <Button
            size="sm"
            variant="outline"
            disabled={ack.isPending}
            onClick={() => ack.mutate({ id, body: {} })}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Acknowledge
          </Button>
        )}
        {canShip && (
          <div className="flex gap-2 items-center">
            <input
              value={trackingInput}
              onChange={e => setTrackingInput(e.target.value)}
              placeholder="Tracking number"
              className="border rounded px-2 h-8 text-xs"
            />
            <Button
              size="sm"
              disabled={ship.isPending || !trackingInput}
              onClick={() => ship.mutate({ id, body: { trackingNumber: trackingInput } })}
            >
              <Truck className="w-3.5 h-3.5" />
              Mark Shipped
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-4 auto-rows-min">
        {/* Summary card */}
        <div className="col-span-2 border border-gray-100 rounded-lg bg-white p-5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Order Summary</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Fabricator</dt>
              <dd className="font-medium">{po.fabricatorName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Requested Delivery</dt>
              <dd>{po.requestedDelivery ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Confirmed Delivery</dt>
              <dd>{po.confirmedDelivery ?? '—'}</dd>
            </div>
            {po.trackingNumber && (
              <div>
                <dt className="text-xs text-muted-foreground">Tracking</dt>
                <dd className="font-mono text-xs">{po.carrier} {po.trackingNumber}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Financials */}
        <div className="border border-gray-100 rounded-lg bg-white p-5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Financials</h2>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{po.currency} {po.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-{po.currency} {po.discountAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{po.currency} {po.taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{po.currency} {po.shippingAmount.toFixed(2)}</span></div>
            <div className="border-t pt-1.5 flex justify-between font-semibold">
              <span>Total</span>
              <span>{po.currency} {po.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="col-span-3 border border-gray-100 rounded-lg bg-white">
          <div className="px-5 py-3 border-b border-gray-50">
            <h2 className="text-xs font-semibold text-gray-900">Line Items</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Product</th>
                <th className="text-left px-4 py-2 font-medium">SKU</th>
                <th className="text-left px-4 py-2 font-medium">Slab Ref</th>
                <th className="text-right px-4 py-2 font-medium">Qty</th>
                <th className="text-right px-4 py-2 font-medium">Unit Price</th>
                <th className="text-right px-4 py-2 font-medium">Total</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {po.lineItems.map(li => (
                <tr key={li.id}>
                  <td className="px-4 py-2.5 font-medium">{li.variantName}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{li.sku}</td>
                  <td className="px-4 py-2.5 text-xs">{li.slabRef ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{li.quantity} {li.unitOfMeasure}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{li.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{li.lineTotal.toFixed(2)}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs capitalize text-muted-foreground">{li.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
