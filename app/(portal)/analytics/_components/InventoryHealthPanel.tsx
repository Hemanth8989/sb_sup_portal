'use client'

import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { formatSqft, formatPrice } from '@/lib/utils/formatters'
import { STATUS_CONFIG } from '@/lib/utils/constants'
import type { InventoryAnalytics } from '@/lib/types/api'

const STATUS_COLORS: Record<string, string> = {
  available: '#22c55e',
  reserved:  '#eab308',
  hold:      '#ef4444',
  allocated: '#3b82f6',
  shipped:   '#a855f7',
  sold:      '#94a3b8',
}

export function InventoryHealthPanel({
  data,
  isPending,
}: {
  data: InventoryAnalytics | undefined
  isPending: boolean
}) {
  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
      </div>
    )
  }

  if (!data) { return null }

  const pieData = data.statusBreakdown.map(s => ({
    name:  (STATUS_CONFIG as Record<string, { label: string }>)[s.status]?.label ?? s.status,
    value: s.slabCount,
    sqft:  s.totalSqft,
    fill:  STATUS_COLORS[s.status] ?? '#94a3b8',
  }))

  return (
    <div className="space-y-6">

      {/* Row 1: Donut + Trend */}
      <div className="grid grid-cols-2 gap-6">

        {/* Status donut */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Status Breakdown</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} slabs`, name]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly inflow trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Weekly Inflow (sqft added)</h3>
          {data.weeklyTrend.length === 0
            ? <p className="text-xs text-muted-foreground text-center pt-10">No data for period</p>
            : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={data.weeklyTrend} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="week"
                      tickFormatter={w => w.slice(5)}
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip
                      formatter={(v) => [typeof v === 'number' ? formatSqft(v) : v, 'Sqft added']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="sqftAdded" fill="#111827" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
        </div>
      </div>

      {/* Row 2: Slow movers */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Slow Movers
          <span className="ml-2 text-xs font-normal text-muted-foreground">Available &gt; 90 days</span>
        </h3>
        {data.slowMovers.length === 0
          ? <p className="text-xs text-muted-foreground">No slow-movers — great stock velocity!</p>
          : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] text-muted-foreground uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-2 text-left font-medium">Ref</th>
                    <th className="pb-2 text-left font-medium">Material</th>
                    <th className="pb-2 text-right font-medium">Sqft</th>
                    <th className="pb-2 text-right font-medium">Est. Value</th>
                    <th className="pb-2 text-right font-medium">Days Available</th>
                    <th className="pb-2 text-left font-medium">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slowMovers.map(s => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 font-mono text-[11px] text-gray-700">{s.internalRef}</td>
                      <td className="py-2 text-gray-600">{s.materialName}</td>
                      <td className="py-2 text-right tabular-nums">{formatSqft(s.netSqft)}</td>
                      <td className="py-2 text-right tabular-nums">{s.estValue != null ? formatPrice(s.estValue) : '—'}</td>
                      <td className="py-2 text-right tabular-nums">
                        <span className={`font-semibold ${s.daysInStatus > 180 ? 'text-red-600' : 'text-amber-600'}`}>
                          {s.daysInStatus}d
                        </span>
                      </td>
                      <td className="py-2 text-gray-500">{s.rackLocation ?? s.warehouseName ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
      </div>
    </div>
  )
}
