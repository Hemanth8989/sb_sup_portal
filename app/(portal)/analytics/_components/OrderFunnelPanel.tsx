'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/utils/formatters'
import type { OrderAnalytics } from '@/lib/types/api'

const STATUS_ORDER = ['pending','acknowledged','in_progress','shipped','received','cancelled']
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', acknowledged: 'Acknowledged', in_progress: 'In Progress',
  shipped: 'Shipped', received: 'Received', cancelled: 'Cancelled',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-200', acknowledged: 'bg-blue-300', in_progress: 'bg-blue-500',
  shipped: 'bg-violet-500', received: 'bg-green-500', cancelled: 'bg-red-400',
}

export function OrderFunnelPanel({
  data,
  isPending,
}: {
  data: OrderAnalytics | undefined
  isPending: boolean
}) {
  if (isPending) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    )
  }

  if (!data) { return null }

  const funnel = STATUS_ORDER.map(s => data.funnel.find(f => f.status === s)).filter(Boolean) as typeof data.funnel
  const maxCount = Math.max(...funnel.map(f => f.poCount), 1)

  const stageTiming = data.stageTiming

  return (
    <div className="space-y-6">

      {/* PO funnel */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Funnel</h3>
        <div className="space-y-2">
          {funnel.map(f => (
            <div key={f.status} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-28 shrink-0">{STATUS_LABEL[f.status] ?? f.status}</span>
              <div className="flex-1 h-6 bg-gray-50 rounded overflow-hidden">
                <div
                  className={`h-full rounded transition-all ${STATUS_COLOR[f.status] ?? 'bg-gray-300'}`}
                  style={{ width: `${(f.poCount / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-gray-900 w-8 text-right">{f.poCount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stage timing + top buyers */}
      <div className="grid grid-cols-2 gap-6">

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Avg Time Per Stage</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-muted-foreground uppercase border-b border-gray-100">
                <th className="pb-2 text-left font-medium">Stage</th>
                <th className="pb-2 text-right font-medium">Avg (hrs)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="py-1.5 text-gray-600">Acknowledgement</td>
                <td className="py-1.5 text-right tabular-nums font-medium text-gray-900">
                  {stageTiming.avgHrsToAck != null ? `${stageTiming.avgHrsToAck.toFixed(1)}h` : '—'}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-1.5 text-gray-600">Shipping</td>
                <td className="py-1.5 text-right tabular-nums font-medium text-gray-900">
                  {stageTiming.avgHrsToShip != null ? `${stageTiming.avgHrsToShip.toFixed(1)}h` : '—'}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-gray-600">Receiving</td>
                <td className="py-1.5 text-right tabular-nums font-medium text-gray-900">
                  {stageTiming.avgHrsToReceive != null ? `${stageTiming.avgHrsToReceive.toFixed(1)}h` : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Buyers by Spend</h3>
          {data.topBuyers.length === 0
            ? <p className="text-xs text-muted-foreground">No data</p>
            : (
                <div className="space-y-2">
                  {data.topBuyers.map((b, i) => (
                    <div key={b.fabricatorName} className="flex items-center gap-2 text-xs">
                      <span className="text-[10px] text-muted-foreground w-4">#{i + 1}</span>
                      <span className="flex-1 truncate text-gray-700">{b.fabricatorName}</span>
                      <span className="font-semibold tabular-nums text-gray-900">{formatPrice(b.totalSpend)}</span>
                      <span className="text-muted-foreground">{b.poCount}PO</span>
                    </div>
                  ))}
                </div>
              )}
        </div>
      </div>

      {/* Cancellation rate */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{(data.cancellationRate * 100).toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">Cancellation rate</p>
        </div>
        <div className="h-10 w-px bg-gray-100" />
        <p className="text-xs text-gray-500">Ratio of cancelled POs vs total POs in the selected period.</p>
      </div>
    </div>
  )
}
