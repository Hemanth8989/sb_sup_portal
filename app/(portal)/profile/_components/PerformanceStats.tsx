'use client'

import { useSupplierStats } from '@/lib/hooks/useSupplierProfile'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils/formatters'

interface StatCardProps { label: string; value: string; sub: string }

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-medium text-foreground tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  )
}

export function PerformanceStats() {
  const { data: stats, isPending } = useSupplierStats()

  return (
    <Card className="shadow-sm" id="performance">
      <CardContent>
        <div className="mb-4">
          <h2 className="text-sm font-medium text-foreground">Performance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Computed from your order history. Read-only — refreshed daily.
            {stats?.updatedAt && ` Last updated ${formatDate(stats.updatedAt)}.`}
          </p>
        </div>

        {isPending
          ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <Skeleton className="h-3 w-32 rounded" />
                    <Skeleton className="h-7 w-16 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                ))}
              </div>
            )
          : (
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Avg. acknowledgement time"
                  value={stats?.avgResponseHrs != null ? `${stats.avgResponseHrs.toFixed(1)} hrs` : '—'}
                  sub="Across last 90 days"
                />
                <StatCard
                  label="Fulfilment rate"
                  value={stats?.fulfillmentRate != null ? `${stats.fulfillmentRate.toFixed(1)}%` : '—'}
                  sub="Orders shipped on time"
                />
                <StatCard
                  label="Avg. lead time"
                  value={stats?.avgLeadDays != null ? `${stats.avgLeadDays.toFixed(1)} days` : '—'}
                  sub="Confirm to ship"
                />
                <StatCard
                  label="Total slabs sold"
                  value={stats?.totalSlabsSold.toLocaleString() ?? '0'}
                  sub="All time"
                />
                <StatCard
                  label="Active warehouses"
                  value={String(stats?.warehouseCount ?? 0)}
                  sub="Registered locations"
                />
              </div>
            )}
      </CardContent>
    </Card>
  )
}
