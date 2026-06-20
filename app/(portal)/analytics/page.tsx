'use client'

import { useState } from 'react'
import { RangePicker } from './_components/RangePicker'
import { InventoryHealthPanel } from './_components/InventoryHealthPanel'
import { RevenuePanels } from './_components/RevenuePanels'
import { OrderFunnelPanel } from './_components/OrderFunnelPanel'
import { ConnectionsPanel } from './_components/ConnectionsPanel'
import {
  useInventoryAnalytics,
  useRevenueAnalytics,
  useOrderAnalytics,
  useConnectionAnalytics,
} from '@/lib/hooks/useAnalytics'
import type { AnalyticsRange } from '@/lib/types/api'

const TABS = [
  { id: 'inventory',   label: 'Inventory Health' },
  { id: 'revenue',     label: 'Revenue' },
  { id: 'orders',      label: 'Orders' },
  { id: 'connections', label: 'Connections' },
] as const

type Tab = typeof TABS[number]['id']

export default function AnalyticsPage() {
  const [tab, setTab]     = useState<Tab>('inventory')
  const [range, setRange] = useState<AnalyticsRange>('30d')

  const inventory   = useInventoryAnalytics(range)
  const revenue     = useRevenueAnalytics(range)
  const orders      = useOrderAnalytics(range)
  const connections = useConnectionAnalytics(range)

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Business intelligence across your operations</p>
          </div>
          <RangePicker value={range} onChange={setRange} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        {tab === 'inventory' && (
          <InventoryHealthPanel data={inventory.data} isPending={inventory.isPending} />
        )}
        {tab === 'revenue' && (
          <RevenuePanels data={revenue.data} isPending={revenue.isPending} />
        )}
        {tab === 'orders' && (
          <OrderFunnelPanel data={orders.data} isPending={orders.isPending} />
        )}
        {tab === 'connections' && (
          <ConnectionsPanel data={connections.data} isPending={connections.isPending} />
        )}
      </div>
    </div>
  )
}
