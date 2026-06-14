'use client'

import { useInventorySummary } from '@/lib/hooks/useSupplierSlabs'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatSqft } from '@/lib/utils/formatters'
import { STATUS_CONFIG } from '@/lib/utils/constants'
import { cn } from '@/lib/utils'
import type { SlabStatus } from '@/lib/types/api'

const CARDS: { status: SlabStatus; sub: (s: { totalSqftOnHand: number }) => string }[] = [
  { status: 'available', sub: s => `${formatSqft(s.totalSqftOnHand)} on hand` },
  { status: 'reserved',  sub: () => 'Awaiting confirmation' },
  { status: 'hold',      sub: () => 'Manually paused' },
  { status: 'allocated', sub: () => 'In confirmed POs' },
  { status: 'shipped',   sub: () => 'Awaiting receipt' },
]

export function KpiCards() {
  const { data, isPending } = useInventorySummary()

  return (
    <div className="flex gap-3 px-6 pt-4">
      {CARDS.map(c => {
        const cfg   = STATUS_CONFIG[c.status]
        const count = (data as Record<string, number> | undefined)?.[c.status] ?? 0

        return (
          <Card key={c.status} size="sm" className="flex-1 ring-0 border border-gray-100 shadow-none">
            <CardContent>
              {isPending
                ? (
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20 rounded" />
                      <Skeleton className="h-7 w-12 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                  )
                : (
                    <>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
                        <span className="text-[11px] text-muted-foreground font-medium">{cfg.label}</span>
                      </div>
                      <div className="text-2xl font-semibold text-foreground tracking-tight">{count}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {c.sub(data ?? { totalSqftOnHand: 0 })}
                      </div>
                    </>
                  )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
