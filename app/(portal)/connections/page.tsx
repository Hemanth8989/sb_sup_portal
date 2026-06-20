'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, Clock, Search, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useConnections, useRespondConnection } from '@/lib/hooks/useConnections'
import { formatDate } from '@/lib/utils/formatters'
import type { ConnectionDto } from '@/lib/types/api'

const STATUS_TABS = [
  { label: 'Active',    value: 'active' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Declined',  value: 'declined' },
  { label: 'All',       value: undefined },
] as const

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
    <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs text-green-700 border-green-200 gap-1"
        disabled={respond.isPending}
        onClick={() => respond.mutate({ id: conn.id, action: 'approve' })}
      >
        <CheckCircle2 className="w-3 h-3" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs text-red-500 gap-1"
        disabled={respond.isPending}
        onClick={() => respond.mutate({ id: conn.id, action: 'decline' })}
      >
        <XCircle className="w-3 h-3" />
        Decline
      </Button>
    </div>
  )
}

export default function ConnectionsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string | undefined>('active')
  const [search, setSearch]       = useState('')
  const [tierFilter, setTierFilter] = useState<string | undefined>(undefined)

  const { data: allData }    = useConnections({})
  const { data, isPending, isError } = useConnections({ status: activeTab })

  const counts = useMemo(() => {
    if (!allData) { return {} }
    return allData.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1
      return acc
    }, {})
  }, [allData])

  const connections = useMemo(() => {
    let list = data ?? []
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.fabricatorName.toLowerCase().includes(q) ||
        (c.fabricatorCity ?? '').toLowerCase().includes(q),
      )
    }
    if (tierFilter) {
      list = list.filter(c => c.pricingTier === tierFilter)
    }
    return list
  }, [data, search, tierFilter])

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <h1 className="text-sm font-semibold text-gray-900">Connections</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search fabricators…"
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex gap-1.5 ml-2">
          {(['standard', 'preferred', 'vip'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTierFilter(prev => prev === t ? undefined : t)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize transition-colors ${
                tierFilter === t
                  ? TIER_COLOR[t].replace('bg-', 'ring-1 ring-') + ' ' + TIER_COLOR[t]
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">{connections.length} shown</span>
      </div>

      {/* Status tabs */}
      <div className="bg-white border-b border-gray-100 px-6 flex gap-1 shrink-0">
        {STATUS_TABS.map(tab => {
          const count = tab.value ? (counts[tab.value] ?? 0) : (allData?.length ?? 0)
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.value
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-muted-foreground hover:text-gray-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] font-semibold rounded-full px-1.5 py-px leading-none ${
                  tab.value === 'pending' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isPending && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
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
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Fabricator</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Tier</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Price List</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Since</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {connections.map(conn => (
                  <tr
                    key={conn.id}
                    className="hover:bg-gray-50/60 cursor-pointer transition-colors"
                    onClick={() => router.push(`/connections/${conn.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{conn.fabricatorName}</p>
                      {conn.fabricatorPhone && (
                        <p className="text-[11px] text-muted-foreground">{conn.fabricatorPhone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
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
                      {conn.assignedPriceListName ?? <span className="italic">None</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {conn.connectedAt ? formatDate(conn.connectedAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {conn.status === 'pending'
                        ? <PendingActions conn={conn} />
                        : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs opacity-0 group-hover:opacity-100"
                              onClick={e => { e.stopPropagation(); router.push(`/connections/${conn.id}`) }}
                            >
                              View →
                            </Button>
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
