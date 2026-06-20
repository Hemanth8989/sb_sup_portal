'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { usePurchaseOrders } from '@/lib/hooks/usePurchaseOrders'
import { formatDate } from '@/lib/utils/formatters'

const STATUS_TABS = [
  { label: 'All',          value: undefined },
  { label: 'Sent',         value: 'sent' },
  { label: 'Acknowledged', value: 'acknowledged' },
  { label: 'Shipped',      value: 'shipped' },
  { label: 'Received',     value: 'received' },
  { label: 'Cancelled',    value: 'cancelled' },
] as const

const STATUS_COLOR: Record<string, string> = {
  draft:            'bg-gray-100 text-gray-600',
  sent:             'bg-blue-50 text-blue-700',
  acknowledged:     'bg-indigo-50 text-indigo-700',
  partially_acked:  'bg-yellow-50 text-yellow-700',
  countered:        'bg-orange-50 text-orange-700',
  confirmed:        'bg-teal-50 text-teal-700',
  shipped:          'bg-violet-50 text-violet-700',
  received:         'bg-green-50 text-green-700',
  closed:           'bg-gray-100 text-gray-500',
  disputed:         'bg-red-50 text-red-600',
  cancelled:        'bg-red-50 text-red-400',
}

const PER_PAGE = 25

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)
  const [search,    setSearch]    = useState('')
  const [page,      setPage]      = useState(1)

  // debounce-free: reset to page 1 when search changes
  function handleSearch(v: string) {
    setSearch(v)
    setPage(1)
  }
  function handleTab(v: string | undefined) {
    setActiveTab(v)
    setPage(1)
  }

  // counts per status (no status filter, no search)
  const { data: allData } = usePurchaseOrders({})
  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const item of allData?.items ?? []) {
      map[item.status] = (map[item.status] ?? 0) + 1
    }
    return map
  }, [allData])

  const { data, isPending, isError } = usePurchaseOrders({
    status:  activeTab,
    search:  search || undefined,
    page,
    perPage: PER_PAGE,
  })

  const orders     = data?.items ?? []
  const total      = data?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <h1 className="text-sm font-semibold text-gray-900">Purchase Orders</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search PO number or fabricator…"
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">{total} orders</span>
      </div>

      {/* Status tabs */}
      <div className="bg-white border-b border-gray-100 px-6 flex gap-1 shrink-0">
        {STATUS_TABS.map(tab => {
          const count = tab.value ? (counts[tab.value] ?? 0) : (allData?.totalCount ?? 0)
          return (
            <button
              key={tab.label}
              onClick={() => handleTab(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.value
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-muted-foreground hover:text-gray-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] font-semibold rounded-full px-1.5 py-px leading-none ${
                  tab.value === 'sent' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {isPending && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-muted-foreground">Failed to load purchase orders.</p>
          </div>
        )}

        {!isPending && !isError && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Package className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No purchase orders found.</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">PO Number</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Fabricator</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Delivery</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Created</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(po => (
                  <tr
                    key={po.id}
                    className="hover:bg-gray-50/60 cursor-pointer transition-colors group"
                    onClick={() => router.push(`/purchase-orders/${po.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{po.poNumber}</td>
                    <td className="px-4 py-3 text-gray-700">{po.fabricatorName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_COLOR[po.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {po.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-xs font-medium">
                      {po.currency} {po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {po.requestedDelivery ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDate(po.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => { e.stopPropagation(); router.push(`/purchase-orders/${po.id}`) }}
                      >
                        View →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
