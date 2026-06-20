'use client'

import { useState } from 'react'
import { CheckCheck, Bell, Package, Link2, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications, useMarkRead, useMarkAllRead } from '@/lib/hooks/useNotifications'
import { formatDate } from '@/lib/utils/formatters'
import type { NotificationType } from '@/lib/types/api'

const TYPE_GROUPS: { label: string; types: NotificationType[] }[] = [
  { label: 'All',         types: [] },
  { label: 'Orders',      types: ['new_po','po_acknowledged','po_partially_acked','po_countered','po_confirmed','po_shipped','po_received','po_disputed','po_cancelled','po_unacked_24h'] },
  { label: 'Connections', types: ['connection_requested','connection_approved','connection_declined','connection_suspended','connection_terminated'] },
  { label: 'Inventory',   types: ['price_changed','new_stock','low_stock_warning'] },
  { label: 'System',      types: ['delivery_confirmed','system'] },
]

function typeIcon(type: NotificationType) {
  if (type.startsWith('po_') || type === 'new_po') { return <Package className="w-4 h-4" /> }
  if (type.startsWith('connection_')) { return <Link2 className="w-4 h-4" /> }
  if (type === 'price_changed' || type === 'new_stock' || type === 'low_stock_warning') { return <TrendingUp className="w-4 h-4" /> }
  if (type === 'po_unacked_24h') { return <AlertCircle className="w-4 h-4 text-amber-500" /> }
  return <Bell className="w-4 h-4" />
}

export function NotificationInbox() {
  const [groupIdx, setGroupIdx] = useState(0)
  const [showUnread, setShowUnread] = useState(false)
  const [page, setPage] = useState(1)

  const group = TYPE_GROUPS[groupIdx]
  const typeParam = group.types.length === 1 ? group.types[0] : undefined

  const { data, isPending } = useNotifications({
    isRead: showUnread ? false : undefined,
    type:   typeParam,
    page,
    perPage: 20,
  })

  const markRead    = useMarkRead()
  const markAllRead = useMarkAllRead()

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {TYPE_GROUPS.map((g, i) => (
            <button
              key={g.label}
              onClick={() => { setGroupIdx(i); setPage(1) }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                groupIdx === i
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowUnread(v => !v); setPage(1) }}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              showUnread ? 'border-gray-900 text-gray-900 bg-gray-50' : 'border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
          >
            {showUnread ? 'Showing unread' : 'All'}
          </button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-xs h-7"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            Mark all read
          </Button>
        </div>
      </div>

      {/* Feed */}
      {isPending
        ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          )
        : data?.items.length === 0
          ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>No notifications</p>
              </div>
            )
          : (
              <div className="space-y-1">
                {data?.items.map(n => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      n.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'
                    }`}
                  >
                    <div className={`mt-0.5 ${n.isRead ? 'text-gray-400' : 'text-blue-600'}`}>
                      {typeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${n.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      {n.linkUrl && (
                        <a href={n.linkUrl} className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                          View →
                        </a>
                      )}
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => markRead.mutate(n.id)}
                        disabled={markRead.isPending}
                        className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2 hover:bg-blue-700 transition-colors"
                        title="Mark as read"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

      {/* Pagination */}
      {data && data.totalCount > 20 && (
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.totalCount)} of {data.totalCount}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="h-7 text-xs">Previous</Button>
            <Button size="sm" variant="outline" disabled={page * 20 >= data.totalCount} onClick={() => setPage(p => p + 1)} className="h-7 text-xs">Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
