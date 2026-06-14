'use client'

import { useInventorySummary } from '@/lib/hooks/useSupplierSlabs'
import { Skeleton } from '@/components/ui/skeleton'
import { formatSqft } from '@/lib/utils/formatters'
import { STATUS_CONFIG } from '@/lib/utils/constants'
import { cn } from '@/lib/utils'
import type { SlabStatus } from '@/lib/types/api'

const CARDS: { status: SlabStatus; sub: (summary: { totalSqftOnHand: number }) => string }[] = [
  { status: 'available',  sub: s => `${formatSqft(s.totalSqftOnHand)} on hand` },
  { status: 'reserved',   sub: () => 'Awaiting PO confirmation' },
  { status: 'hold',       sub: () => 'Manually paused' },
  { status: 'allocated',  sub: () => 'In confirmed POs' },
  { status: 'shipped',    sub: () => 'Awaiting receipt' },
]

export function KpiCards() {
  const { data, isPending } = useInventorySummary()

  if (isPending) {
    return (
      <div className="flex gap-3 px-6 pt-4">
        {CARDS.map(c => (
          <Skeleton key={c.status} className="flex-1 h-20 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3 px-6 pt-4">
      {CARDS.map(c => {
        const cfg   = STATUS_CONFIG[c.status]
        const count = (data as Record<string, number> | undefined)?.[c.status] ?? 0
        return (
          <div key={c.status} className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
              <span className={cn('w-2 h-2 rounded-full', cfg.dot)} />
              {cfg.label}
            </div>
            <div className="text-2xl font-bold text-slate-900">{count}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{c.sub(data ?? { totalSqftOnHand: 0 })}</div>
          </div>
        )
      })}
    </div>
  )
}
