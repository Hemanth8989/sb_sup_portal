'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/utils/formatters'
import type { RevenueAnalytics } from '@/lib/types/api'

const MATERIAL_COLORS = ['#111827','#374151','#6b7280','#9ca3af','#d1d5db','#e5e7eb']

export function RevenuePanels({
  data,
  isPending,
}: {
  data: RevenueAnalytics | undefined
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

  return (
    <div className="space-y-6">

      {/* Monthly revenue bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Revenue (shipped POs)</h3>
        {data.monthlyRevenue.length === 0
          ? <p className="text-xs text-muted-foreground text-center py-10">No shipped POs in this period</p>
          : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.monthlyRevenue} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false} tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    formatter={(v) => [typeof v === 'number' ? formatPrice(v) : v, 'Revenue']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="revenue" fill="#111827" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
      </div>

      {/* Material breakdown + price override */}
      <div className="grid grid-cols-2 gap-6">

        {/* Revenue by material table */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Revenue by Material</h3>
          {data.revenueByMaterial.length === 0
            ? <p className="text-xs text-muted-foreground">No data</p>
            : (
                <div className="space-y-2">
                  {data.revenueByMaterial.map((m, i) => (
                    <div key={m.materialName} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ background: MATERIAL_COLORS[i % MATERIAL_COLORS.length] }}
                      />
                      <span className="text-xs text-gray-700 flex-1 truncate">{m.materialName}</span>
                      <span className="text-xs font-semibold tabular-nums text-gray-900">{formatPrice(m.revenue)}</span>
                      <span className="text-[10px] text-muted-foreground w-10 text-right">{m.slabsSold}sl</span>
                    </div>
                  ))}
                </div>
              )}
        </div>

        {/* Price override donut */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Overrides</h3>
          {data.priceOverrideUsage == null
            ? <p className="text-xs text-muted-foreground">No data</p>
            : (() => {
                const ov = data.priceOverrideUsage
                const total = ov.withOverride + ov.withoutOverride
                const pie = [
                  { name: 'Overridden', value: ov.withOverride,    fill: '#111827' },
                  { name: 'List price', value: ov.withoutOverride,  fill: '#e5e7eb' },
                ]
                const pct = total > 0 ? ((ov.withOverride / total) * 100).toFixed(1) : '0.0'
                return (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie data={pie} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={2} dataKey="value">
                          {pie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Overridden lines</p>
                        <p className="font-semibold text-gray-900">{ov.withOverride} / {total}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Override rate</p>
                        <p className="font-semibold text-gray-900">{pct}%</p>
                      </div>
                    </div>
                  </div>
                )
              })()}
        </div>
      </div>
    </div>
  )
}
