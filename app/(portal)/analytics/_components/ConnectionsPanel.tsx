'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import type { ConnectionAnalytics } from '@/lib/types/api'

const TIER_COLORS: Record<string, string> = {
  platinum: '#7c3aed',
  gold:     '#d97706',
  silver:   '#6b7280',
  standard: '#111827',
}

const STATUS_COLOR: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  pending:   'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
  declined:  'bg-gray-100 text-gray-600',
  terminated:'bg-gray-100 text-gray-600',
}

export function ConnectionsPanel({
  data,
  isPending,
}: {
  data: ConnectionAnalytics | undefined
  isPending: boolean
}) {
  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-6">
        {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    )
  }

  if (!data) { return null }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">

        {/* Status + tier breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">By Status &amp; Tier</h3>
          <div className="space-y-1.5">
            {data.byStatusAndTier.map(s => (
              <div key={`${s.status}-${s.pricingTier}`} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLOR[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {s.status}
                  </span>
                  {s.pricingTier && (
                    <span className="font-medium" style={{ color: TIER_COLORS[s.pricingTier] ?? '#111827' }}>
                      {s.pricingTier}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-gray-900 tabular-nums">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top cities */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Cities</h3>
          {data.topCities.length === 0
            ? <p className="text-xs text-muted-foreground">No location data</p>
            : (
                <div className="space-y-2">
                  {data.topCities.map((c, i) => (
                    <div key={`${c.city}-${i}`} className="flex items-center gap-2 text-xs">
                      <span className="text-[10px] text-muted-foreground w-4">#{i + 1}</span>
                      <span className="flex-1 text-gray-700">{c.city ?? 'Unknown'}{c.state ? `, ${c.state}` : ''}</span>
                      <span className="font-semibold text-gray-900 tabular-nums">{c.connectionCount}</span>
                    </div>
                  ))}
                </div>
              )}
        </div>
      </div>

      {/* Monthly growth line */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Growth</h3>
        {data.monthlyGrowth.length === 0
          ? <p className="text-xs text-muted-foreground text-center py-10">No connection history in this period</p>
          : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={data.monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false} tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    formatter={(v) => [v, 'New connections']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newConnections"
                    name="New connections"
                    stroke="#111827"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#111827', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
      </div>
    </div>
  )
}
