'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useConnections, useRespondConnection } from '@/lib/hooks/useConnections'
import type { ConnectionDto } from '@/lib/types/api'

const STATUS_TABS = [
  { label: 'Active',    value: 'active' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'All',       value: undefined },
]

const STATUS_COLOR: Record<string, string> = {
  active:     'bg-green-50 text-green-700',
  pending:    'bg-yellow-50 text-yellow-700',
  suspended:  'bg-orange-50 text-orange-700',
  declined:   'bg-red-50 text-red-500',
  terminated: 'bg-gray-100 text-gray-500',
}

const TIER_COLOR: Record<string, string> = {
  standard:  'bg-gray-100 text-gray-600',
  preferred: 'bg-blue-50 text-blue-700',
  vip:       'bg-violet-50 text-violet-700',
}

function PendingActions({ conn }: { conn: ConnectionDto }) {
  const respond = useRespondConnection()
  return (
    <div className="flex gap-1.5">
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs text-green-700 border-green-200"
        disabled={respond.isPending}
        onClick={e => { e.stopPropagation(); respond.mutate({ id: conn.id, action: 'approve' }) }}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs text-red-500"
        disabled={respond.isPending}
        onClick={e => { e.stopPropagation(); respond.mutate({ id: conn.id, action: 'decline' }) }}
      >
        Decline
      </Button>
    </div>
  )
}

export default function ConnectionsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string | undefined>('active')
  const { data, isPending, isError } = useConnections({ status: activeTab })

  const connections = data ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <h1 className="text-sm font-semibold text-gray-900">Connections</h1>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">{connections.length} connections</span>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6 flex gap-1 shrink-0">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-muted-foreground hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isPending && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-muted-foreground">Failed to load connections.</p>
          </div>
        )}

        {!isPending && !isError && connections.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Link2 className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No connections found.</p>
          </div>
        )}

        {connections.length > 0 && (
          <div className="border border-gray-100 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Fabricator</th>
                  <th className="text-left px-4 py-2 font-medium">Location</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Tier</th>
                  <th className="text-left px-4 py-2 font-medium">Price List</th>
                  <th className="text-left px-4 py-2 font-medium">Since</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {connections.map(conn => (
                  <tr
                    key={conn.id}
                    className="hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => router.push(`/connections/${conn.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">{conn.fabricatorName}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {[conn.fabricatorCity, conn.fabricatorState].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_COLOR[conn.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {conn.status === 'pending' && <Clock className="w-3 h-3" />}
                        {conn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${TIER_COLOR[conn.pricingTier] ?? 'bg-gray-100 text-gray-600'}`}>
                        {conn.pricingTier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {conn.assignedPriceListName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {conn.connectedAt ? new Date(conn.connectedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      {conn.status === 'pending' ? (
                        <PendingActions conn={conn} />
                      ) : (
                        <Button variant="ghost" size="sm" className="h-7 text-xs">View</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
