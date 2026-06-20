'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Truck, CheckCircle2, XCircle, Pencil, Check, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  usePurchaseOrder,
  useAcknowledgePo,
  useShipPo,
  useCancelPo,
  useUpdatePoNotes,
} from '@/lib/hooks/usePurchaseOrders'
import { formatDate } from '@/lib/utils/formatters'
import type { PoLineItemDto } from '@/lib/types/api'

const STATUS_COLOR: Record<string, string> = {
  draft:           'bg-gray-100 text-gray-600',
  sent:            'bg-blue-50 text-blue-700',
  acknowledged:    'bg-indigo-50 text-indigo-700',
  partially_acked: 'bg-yellow-50 text-yellow-700',
  confirmed:       'bg-teal-50 text-teal-700',
  shipped:         'bg-violet-50 text-violet-700',
  received:        'bg-green-50 text-green-700',
  disputed:        'bg-red-50 text-red-600',
  cancelled:       'bg-red-50 text-red-400',
}

const LINE_STATUS_COLOR: Record<string, string> = {
  pending:  'text-muted-foreground',
  accepted: 'text-green-600',
  declined: 'text-red-500',
  countered:'text-orange-600',
}

const CARRIERS = ['FedEx', 'UPS', 'USPS', 'DHL', 'Other']

// ─── Modals ──────────────────────────────────────────────────────────────────

function AcknowledgeModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: (supplierNotes: string, confirmedDelivery: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [notes,    setNotes]    = useState('')
  const [delivery, setDelivery] = useState('')

  return (
    <Overlay onClose={onCancel}>
      <ModalCard title="Acknowledge PO" description="Confirm receipt and optionally set a confirmed delivery date.">
        <label className="block text-[11px] text-muted-foreground mb-1">Confirmed Delivery Date</label>
        <input
          type="date"
          value={delivery}
          onChange={e => setDelivery(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <label className="block text-[11px] text-muted-foreground mb-1">Supplier Notes (visible to fabricator)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Optional message to the fabricator…"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <ModalFooter onCancel={onCancel}>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isPending}
            onClick={() => onConfirm(notes, delivery)}
          >
            {isPending ? 'Acknowledging…' : 'Acknowledge'}
          </Button>
        </ModalFooter>
      </ModalCard>
    </Overlay>
  )
}

function ShipModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: (trackingNumber: string, carrier: string, confirmedDelivery: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [tracking,  setTracking]  = useState('')
  const [carrier,   setCarrier]   = useState('')
  const [delivery,  setDelivery]  = useState('')

  return (
    <Overlay onClose={onCancel}>
      <ModalCard title="Mark as Shipped" description="Enter shipment details. The fabricator will be notified.">
        <label className="block text-[11px] text-muted-foreground mb-1">Tracking Number *</label>
        <input
          autoFocus
          value={tracking}
          onChange={e => setTracking(e.target.value)}
          placeholder="1Z999AA10123456784"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <label className="block text-[11px] text-muted-foreground mb-1">Carrier</label>
        <select
          value={carrier}
          onChange={e => setCarrier(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        >
          <option value="">Select carrier…</option>
          {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="block text-[11px] text-muted-foreground mb-1">Estimated Delivery</label>
        <input
          type="date"
          value={delivery}
          onChange={e => setDelivery(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <ModalFooter onCancel={onCancel}>
          <Button
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={isPending || !tracking}
            onClick={() => onConfirm(tracking, carrier, delivery)}
          >
            {isPending ? 'Saving…' : 'Confirm Shipment'}
          </Button>
        </ModalFooter>
      </ModalCard>
    </Overlay>
  )
}

function CancelModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: (reason: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [reason, setReason] = useState('')
  return (
    <Overlay onClose={onCancel}>
      <ModalCard title="Cancel Purchase Order" description="This cannot be undone. The fabricator will be notified of the cancellation.">
        <label className="block text-[11px] text-muted-foreground mb-1">Reason (optional)</label>
        <textarea
          autoFocus
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <ModalFooter onCancel={onCancel}>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isPending}
            onClick={() => onConfirm(reason)}
          >
            {isPending ? 'Cancelling…' : 'Cancel Order'}
          </Button>
        </ModalFooter>
      </ModalCard>
    </Overlay>
  )
}

// Shared modal primitives
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}
function ModalCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-xl p-6 w-[440px] space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  )
}
function ModalFooter({ onCancel, children }: { onCancel: () => void; children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      {children}
    </div>
  )
}

// ─── Inline supplier notes ────────────────────────────────────────────────────

function SupplierNotesEditor({ poId, current }: { poId: string; current: string | null }) {
  const [editing, setEditing] = useState(false)
  const [value,   setValue]   = useState(current ?? '')
  const updateNotes = useUpdatePoNotes()

  function save() {
    updateNotes.mutate(
      { id: poId, notes: value.trim() || null },
      { onSuccess: () => setEditing(false) },
    )
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <textarea
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={4}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          placeholder="Notes visible to the fabricator…"
        />
        <div className="flex gap-2">
          <Button size="sm" className="h-7 text-xs" disabled={updateNotes.isPending} onClick={save}>
            <Check className="w-3 h-3 mr-1" />
            {updateNotes.isPending ? 'Saving…' : 'Save'}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setValue(current ?? ''); setEditing(false) }}>
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group cursor-pointer min-h-[3rem] rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors relative"
      onClick={() => setEditing(true)}
    >
      {current
        ? <p className="whitespace-pre-wrap">{current}</p>
        : <p className="text-muted-foreground italic">Click to add notes…</p>}
      <Pencil className="w-3 h-3 text-muted-foreground absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function TimelineEvent({ label, date, color = 'bg-gray-300' }: { label: string; date: string | null; color?: string }) {
  if (!date) { return null }
  return (
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${color}`} />
      <div>
        <p className="text-xs font-medium text-gray-700">{label}</p>
        <p className="text-[11px] text-muted-foreground">{formatDate(date)}</p>
      </div>
    </div>
  )
}

// ─── Line item status badge ───────────────────────────────────────────────────

function LineStatusBadge({ item }: { item: PoLineItemDto }) {
  const cls = LINE_STATUS_COLOR[item.status] ?? 'text-muted-foreground'
  return (
    <div>
      <span className={`text-xs capitalize font-medium ${cls}`}>{item.status}</span>
      {item.counterPrice != null && (
        <p className="text-[10px] text-orange-600">Counter: {item.counterPrice.toFixed(2)}</p>
      )}
      {item.declineReason && (
        <p className="text-[10px] text-red-500">{item.declineReason}</p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Modal = 'acknowledge' | 'ship' | 'cancel' | null

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const { data: po, isPending, isError } = usePurchaseOrder(id)
  const ack    = useAcknowledgePo()
  const ship   = useShipPo()
  const cancel = useCancelPo()

  const [modal, setModal] = useState<Modal>(null)

  if (isPending) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="p-6 grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isError || !po) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Purchase order not found.</p>
      </div>
    )
  }

  const canAck    = po.status === 'sent'
  const canShip   = po.status === 'acknowledged' || po.status === 'confirmed'
  const canCancel = !['received', 'cancelled'].includes(po.status)

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900 font-mono">{po.poNumber}</h1>
        {po.internalRef && (
          <span className="text-xs text-muted-foreground">· {po.internalRef}</span>
        )}
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_COLOR[po.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {po.status.replace(/_/g, ' ')}
        </span>
        <div className="flex-1" />
        {canAck && (
          <Button size="sm" variant="outline" className="gap-1.5 text-indigo-700 border-indigo-200"
            onClick={() => setModal('acknowledge')}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Acknowledge
          </Button>
        )}
        {canShip && (
          <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
            onClick={() => setModal('ship')}
          >
            <Truck className="w-3.5 h-3.5" />
            Mark Shipped
          </Button>
        )}
        {canCancel && (
          <Button size="sm" variant="ghost" className="gap-1.5 text-red-500"
            onClick={() => setModal('cancel')}
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-4 auto-rows-min">

          {/* Order details */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Order Details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-[11px] text-muted-foreground mb-0.5">Fabricator</dt>
                <dd className="font-medium text-gray-900">{po.fabricatorName}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground mb-0.5">Requested Delivery</dt>
                <dd>{po.requestedDelivery ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground mb-0.5">Confirmed Delivery</dt>
                <dd>{po.confirmedDelivery ?? '—'}</dd>
              </div>
              {po.trackingNumber && (
                <div>
                  <dt className="text-[11px] text-muted-foreground mb-0.5">Tracking</dt>
                  <dd className="font-mono text-xs">{[po.carrier, po.trackingNumber].filter(Boolean).join(' · ')}</dd>
                </div>
              )}
              {po.fabricatorNotes && (
                <div className="col-span-2">
                  <dt className="text-[11px] text-muted-foreground mb-0.5">Fabricator Notes</dt>
                  <dd className="text-gray-700 whitespace-pre-wrap">{po.fabricatorNotes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Financials */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Financials</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{po.currency} {po.subtotal.toFixed(2)}</span>
              </div>
              {po.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="tabular-nums text-green-600">-{po.currency} {po.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {po.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="tabular-nums">{po.currency} {po.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {po.shippingAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="tabular-nums">{po.currency} {po.shippingAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-1.5 flex justify-between font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{po.currency} {po.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Supplier notes */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Supplier Notes</h2>
            <p className="text-[11px] text-muted-foreground mb-2">Visible to the fabricator</p>
            <SupplierNotesEditor poId={id} current={po.supplierNotes} />
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Timeline</h2>
            <div className="space-y-3">
              <TimelineEvent label="Created"      date={po.createdAt}   color="bg-gray-400" />
              <TimelineEvent label="Sent"         date={po.sentAt}      color="bg-blue-400" />
              <TimelineEvent label="Acknowledged" date={po.ackedAt}     color="bg-indigo-500" />
              <TimelineEvent label="Shipped"      date={po.shippedAt}   color="bg-violet-500" />
              <TimelineEvent label="Received"     date={po.receivedAt}  color="bg-green-500" />
            </div>
          </div>

          {/* Line items */}
          <div className="col-span-3 bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Line Items
              </h2>
              <span className="text-xs text-muted-foreground">{po.lineItems.length} items</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Product</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">SKU</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Slab Ref</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Qty</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Unit Price</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {po.lineItems.map(li => (
                  <tr key={li.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{li.variantName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{li.sku}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{li.slabRef ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-xs">{li.quantity} {li.unitOfMeasure}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-xs">{li.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-xs font-medium">{li.lineTotal.toFixed(2)}</td>
                    <td className="px-4 py-3"><LineStatusBadge item={li} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-gray-100 bg-gray-50/50">
                <tr>
                  <td colSpan={5} className="px-4 py-2.5 text-xs font-medium text-right text-muted-foreground">Order Total</td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-right tabular-nums">
                    {po.currency} {po.totalAmount.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal === 'acknowledge' && (
        <AcknowledgeModal
          isPending={ack.isPending}
          onConfirm={(supplierNotes, confirmedDelivery) => {
            ack.mutate(
              { id, body: { supplierNotes: supplierNotes || undefined, confirmedDelivery: confirmedDelivery || undefined } },
              { onSuccess: () => setModal(null) },
            )
          }}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === 'ship' && (
        <ShipModal
          isPending={ship.isPending}
          onConfirm={(trackingNumber, carrier, confirmedDelivery) => {
            ship.mutate(
              { id, body: { trackingNumber, carrier: carrier || undefined, confirmedDelivery: confirmedDelivery || undefined } },
              { onSuccess: () => setModal(null) },
            )
          }}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === 'cancel' && (
        <CancelModal
          isPending={cancel.isPending}
          onConfirm={reason => {
            cancel.mutate(
              { id, reason: reason || undefined },
              { onSuccess: () => setModal(null) },
            )
          }}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  )
}
