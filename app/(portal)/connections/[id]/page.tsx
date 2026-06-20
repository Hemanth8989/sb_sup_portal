'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, CheckCircle2, XCircle, PauseCircle, PlayCircle,
  OctagonX, Pencil, Check, X, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useConnection,
  useRespondConnection,
  useUpdateConnectionTier,
  useAssignPriceList,
  useUpdateConnectionNotes,
} from '@/lib/hooks/useConnections'
import { usePriceLists } from '@/lib/hooks/usePriceLists'
import { formatDate } from '@/lib/utils/formatters'

const STATUS_COLOR: Record<string, string> = {
  active:     'bg-green-50 text-green-700',
  pending:    'bg-yellow-50 text-yellow-700',
  suspended:  'bg-orange-50 text-orange-700',
  declined:   'bg-red-50 text-red-500',
  terminated: 'bg-gray-100 text-gray-500',
}

const TIERS = ['standard', 'preferred', 'vip'] as const
const TIER_COLOR: Record<string, string> = {
  standard:  'bg-gray-100 text-gray-700',
  preferred: 'bg-blue-50 text-blue-700',
  vip:       'bg-violet-50 text-violet-700',
}

// Modal for actions that require a reason (suspend / terminate)
function ReasonModal({
  title,
  description,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
}: {
  title: string
  description: string
  confirmLabel: string
  confirmClass: string
  onConfirm: (reason: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl p-6 w-[420px] space-y-4" onClick={e => e.stopPropagation()}>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <textarea
          autoFocus
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason (optional)"
          rows={3}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" className={confirmClass} onClick={() => onConfirm(reason)}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Inline notes editor
function NotesEditor({ connectionId, current }: { connectionId: string; current: string | null }) {
  const [editing, setEditing] = useState(false)
  const [value,   setValue]   = useState(current ?? '')
  const updateNotes = useUpdateConnectionNotes()

  function save() {
    updateNotes.mutate(
      { id: connectionId, notes: value.trim() || null },
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
          placeholder="Internal notes about this fabricator…"
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
        : <p className="text-muted-foreground italic">Click to add internal notes…</p>}
      <Pencil className="w-3 h-3 text-muted-foreground absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

// Price list assignment dropdown
function PriceListSelector({ connectionId, currentId, currentName }: {
  connectionId: string
  currentId: string | null
  currentName: string | null
}) {
  const [open, setOpen] = useState(false)
  const { data: lists } = usePriceLists()
  const assign = useAssignPriceList()

  function select(id: string | null) {
    assign.mutate({ id: connectionId, priceListId: id })
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-gray-400 transition-colors text-left"
      >
        <span className="flex-1 truncate">{currentName ?? <span className="text-muted-foreground italic">None assigned</span>}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
              <button
                onClick={() => select(null)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${!currentId ? 'font-medium' : 'text-muted-foreground'}`}
              >
                None
              </button>
              {(lists ?? []).filter(l => l.isActive).map(l => (
                <button
                  key={l.id}
                  onClick={() => select(l.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${currentId === l.id ? 'font-medium' : ''}`}
                >
                  <span className="truncate">{l.name}</span>
                  <span className={`text-[10px] font-medium capitalize px-1.5 py-0.5 rounded-full ml-2 shrink-0 ${TIER_COLOR[l.tier] ?? 'bg-gray-100'}`}>{l.tier}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

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

export default function ConnectionDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()

  const { data: conn, isPending, isError } = useConnection(id)
  const respond    = useRespondConnection()
  const updateTier = useUpdateConnectionTier()

  const [modal, setModal] = useState<'suspend' | 'terminate' | null>(null)

  if (isPending) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isError || !conn) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Connection not found.</p>
      </div>
    )
  }

  function handleRespond(action: string, reason?: string) {
    respond.mutate({ id, action, reason })
    setModal(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900">{conn.fabricatorName}</h1>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_COLOR[conn.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {conn.status}
        </span>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${TIER_COLOR[conn.pricingTier] ?? 'bg-gray-100 text-gray-600'}`}>
          {conn.pricingTier}
        </span>

        <div className="flex-1" />

        {/* Status action buttons */}
        {conn.status === 'pending' && (
          <>
            <Button size="sm" variant="outline" className="text-green-700 border-green-200 gap-1.5"
              disabled={respond.isPending}
              onClick={() => handleRespond('approve')}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve
            </Button>
            <Button size="sm" variant="ghost" className="text-red-500 gap-1.5"
              disabled={respond.isPending}
              onClick={() => handleRespond('decline')}
            >
              <XCircle className="w-3.5 h-3.5" />
              Decline
            </Button>
          </>
        )}
        {conn.status === 'active' && (
          <>
            <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 gap-1.5"
              onClick={() => setModal('suspend')}
            >
              <PauseCircle className="w-3.5 h-3.5" />
              Suspend
            </Button>
            <Button size="sm" variant="ghost" className="text-red-500 gap-1.5"
              onClick={() => setModal('terminate')}
            >
              <OctagonX className="w-3.5 h-3.5" />
              Terminate
            </Button>
          </>
        )}
        {conn.status === 'suspended' && (
          <>
            <Button size="sm" variant="outline" className="text-green-700 border-green-200 gap-1.5"
              disabled={respond.isPending}
              onClick={() => handleRespond('reactivate')}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Reactivate
            </Button>
            <Button size="sm" variant="ghost" className="text-red-500 gap-1.5"
              onClick={() => setModal('terminate')}
            >
              <OctagonX className="w-3.5 h-3.5" />
              Terminate
            </Button>
          </>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4 auto-rows-min">

          {/* Fabricator Profile */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Fabricator Profile</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[11px] text-muted-foreground mb-0.5">Company</dt>
                <dd className="font-medium text-gray-900">{conn.fabricatorName}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground mb-0.5">Location</dt>
                <dd>{[conn.fabricatorCity, conn.fabricatorState].filter(Boolean).join(', ') || '—'}</dd>
              </div>
              {conn.fabricatorPhone && (
                <div>
                  <dt className="text-[11px] text-muted-foreground mb-0.5">Phone</dt>
                  <dd>{conn.fabricatorPhone}</dd>
                </div>
              )}
              <div>
                <dt className="text-[11px] text-muted-foreground mb-0.5">Requested</dt>
                <dd>{formatDate(conn.requestedAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Pricing Configuration */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Pricing Configuration</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-muted-foreground mb-2">Pricing Tier</p>
                <div className="flex gap-1.5">
                  {TIERS.map(t => (
                    <button
                      key={t}
                      onClick={() => updateTier.mutate({ id, tier: t })}
                      disabled={updateTier.isPending}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize border transition-colors ${
                        conn.pricingTier === t
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-2">Assigned Price List</p>
                <PriceListSelector
                  connectionId={id}
                  currentId={conn.assignedPriceListId}
                  currentName={conn.assignedPriceListName}
                />
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Internal Notes</h2>
            <p className="text-[11px] text-muted-foreground mb-2">Private — not visible to the fabricator</p>
            <NotesEditor connectionId={id} current={conn.fabricatorNotes} />
          </div>

          {/* Connection Timeline */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Timeline</h2>
            <div className="space-y-3">
              <TimelineEvent label="Connection requested"  date={conn.requestedAt}  color="bg-gray-400" />
              <TimelineEvent label="Connected / Approved"  date={conn.connectedAt}   color="bg-green-500" />
              <TimelineEvent label="Suspended"             date={conn.suspendedAt}   color="bg-orange-400" />
              <TimelineEvent label="Terminated"            date={conn.terminatedAt}  color="bg-red-500" />
            </div>
            {conn.declineReason && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[11px] text-muted-foreground mb-1">Reason on record</p>
                <p className="text-sm text-gray-700 italic">{conn.declineReason}</p>
              </div>
            )}
          </div>

          {/* Request message (full width if present) */}
          {conn.requestMessage && (
            <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Request Message</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{conn.requestMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal === 'suspend' && (
        <ReasonModal
          title="Suspend Connection"
          description="The fabricator will lose access to your catalog until reactivated. You can reactivate at any time."
          confirmLabel="Suspend"
          confirmClass="bg-orange-600 hover:bg-orange-700 text-white"
          onConfirm={reason => handleRespond('suspend', reason)}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === 'terminate' && (
        <ReasonModal
          title="Terminate Connection"
          description="This will permanently end the connection. The fabricator will need to request a new connection to work with you again."
          confirmLabel="Terminate"
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          onConfirm={reason => handleRespond('terminate', reason)}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  )
}
