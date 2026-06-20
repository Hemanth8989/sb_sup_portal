'use client'

import {
  Package, ArrowRightLeft, Activity,
  RefreshCw, TrendingDown, TrendingUp, Clock,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useWarehouseHistory } from '@/lib/hooks/useWarehouses'
import type { WarehouseAuditEventDto } from '@/lib/types/api'

interface Props {
  warehouseId: string
}

function eventIcon(e: WarehouseAuditEventDto) {
  if (e.eventSource === 'slab_transfer') { return <ArrowRightLeft className="w-3.5 h-3.5" /> }
  if (e.eventSource === 'slab_event')    { return <Activity className="w-3.5 h-3.5" /> }
  if (e.eventType === 'receive')         { return <TrendingUp className="w-3.5 h-3.5" /> }
  if (e.eventType === 'transfer_out')    { return <TrendingDown className="w-3.5 h-3.5" /> }
  if (e.eventType === 'transfer_in')     { return <TrendingUp className="w-3.5 h-3.5" /> }
  if (e.eventType === 'adjustment')      { return <RefreshCw className="w-3.5 h-3.5" /> }
  return <Package className="w-3.5 h-3.5" />
}

function eventColors(e: WarehouseAuditEventDto): string {
  if (e.eventSource === 'slab_transfer')  { return 'bg-blue-50 text-blue-700 border-blue-100' }
  if (e.eventSource === 'slab_event')     { return 'bg-amber-50 text-amber-700 border-amber-100' }
  if (e.eventType === 'receive')          { return 'bg-emerald-50 text-emerald-700 border-emerald-100' }
  if (e.eventType === 'transfer_out')     { return 'bg-red-50 text-red-600 border-red-100' }
  if (e.eventType === 'transfer_in')      { return 'bg-emerald-50 text-emerald-700 border-emerald-100' }
  if (e.eventType === 'adjustment')       { return 'bg-purple-50 text-purple-700 border-purple-100' }
  return 'bg-gray-50 text-gray-600 border-gray-100'
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function groupByDate(events: WarehouseAuditEventDto[]): [string, WarehouseAuditEventDto[]][] {
  const map = new Map<string, WarehouseAuditEventDto[]>()
  for (const e of events) {
    const key = new Date(e.createdAt).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
    if (!map.has(key)) { map.set(key, []) }
    map.get(key)!.push(e)
  }
  return [...map.entries()]
}

export function WarehouseHistory({ warehouseId }: Props) {
  const { data: events, isPending } = useWarehouseHistory(warehouseId)

  if (isPending) {
    return (
      <div className="space-y-2 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2">
        <Clock className="w-7 h-7 text-gray-300" />
        <p className="text-sm text-gray-400">No activity recorded yet.</p>
        <p className="text-xs text-gray-400">
          Transfer slabs, adjust product stock, or change slab status to see events here.
        </p>
      </div>
    )
  }

  const groups = groupByDate(events)

  return (
    <div className="space-y-6">
      {groups.map(([date, group]) => (
        <div key={date}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{date}</p>
          <div className="space-y-1.5">
            {group.map(e => (
              <div
                key={e.id}
                className="flex items-start gap-3 px-4 py-3 rounded-xl border bg-white hover:bg-gray-50 transition-colors"
              >
                {/* Icon badge */}
                <span className={`mt-0.5 shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg border ${eventColors(e)}`}>
                  {eventIcon(e)}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 leading-snug">{e.description}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {e.subjectRef && (
                      <span className="text-xs text-gray-400 font-mono">{e.subjectRef}</span>
                    )}
                    {e.qty != null && (
                      <span className="text-xs text-gray-400">qty: {e.qty}</span>
                    )}
                    {e.notes && (
                      <span className="text-xs text-gray-400 italic truncate">{e.notes}</span>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <p className="text-[11px] text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">
                  {formatDate(e.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
