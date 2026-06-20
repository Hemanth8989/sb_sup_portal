'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api/client'

type Channel = 'in_app' | 'email'

const EVENTS: { key: string; label: string; group: string }[] = [
  { key: 'new_po',             label: 'New purchase order received',     group: 'Orders' },
  { key: 'po_acknowledged',    label: 'PO acknowledged by supplier',     group: 'Orders' },
  { key: 'po_countered',       label: 'PO counter-offer received',       group: 'Orders' },
  { key: 'po_confirmed',       label: 'PO confirmed',                    group: 'Orders' },
  { key: 'po_shipped',         label: 'PO marked as shipped',            group: 'Orders' },
  { key: 'po_received',        label: 'PO marked as received',           group: 'Orders' },
  { key: 'po_disputed',        label: 'PO disputed',                     group: 'Orders' },
  { key: 'po_cancelled',       label: 'PO cancelled',                    group: 'Orders' },
  { key: 'po_unacked_24h',     label: 'PO unacknowledged after 24 h',    group: 'Orders' },
  { key: 'connection_requested',  label: 'New connection request',        group: 'Connections' },
  { key: 'connection_approved',   label: 'Connection approved',           group: 'Connections' },
  { key: 'connection_declined',   label: 'Connection declined',           group: 'Connections' },
  { key: 'connection_suspended',  label: 'Connection suspended',          group: 'Connections' },
  { key: 'connection_terminated', label: 'Connection terminated',         group: 'Connections' },
  { key: 'price_changed',      label: 'Price list updated by partner',   group: 'Inventory' },
  { key: 'new_stock',          label: 'New stock added',                 group: 'Inventory' },
  { key: 'low_stock_warning',  label: 'Low stock warning',               group: 'Inventory' },
  { key: 'delivery_confirmed', label: 'Delivery confirmed',              group: 'System' },
  { key: 'system',             label: 'System announcements',            group: 'System' },
]

const GROUPS = ['Orders', 'Connections', 'Inventory', 'System']

type PrefsMap = Record<string, Record<Channel, boolean>>

function defaultPrefs(): PrefsMap {
  const p: PrefsMap = {}
  for (const e of EVENTS) {
    p[e.key] = { in_app: true, email: false }
  }
  return p
}

function parseApiPrefs(raw: Record<string, unknown>): PrefsMap {
  const base = defaultPrefs()
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'object' && v !== null && k in base) {
      const ch = v as Record<string, unknown>
      base[k] = {
        in_app: ch['in_app'] !== false,
        email:  ch['email'] === true,
      }
    }
  }
  return base
}

export function NotificationPrefsMatrix() {
  const qc = useQueryClient()

  const { data: rawPrefs, isPending } = useQuery({
    queryKey: ['notification-prefs'],
    queryFn:  (): Promise<Record<string, unknown>> => api.get('/api/v1/supplier/profile/notification-prefs'),
    staleTime: 60_000,
  })

  const [prefs, setPrefs] = useState<PrefsMap>(defaultPrefs())
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (rawPrefs) {
      setPrefs(parseApiPrefs(rawPrefs))
      setDirty(false)
    }
  }, [rawPrefs])

  const save = useMutation({
    mutationFn: (p: PrefsMap) => api.patch('/api/v1/supplier/profile/notification-prefs', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-prefs'] })
      setDirty(false)
    },
  })

  function toggle(key: string, ch: Channel) {
    setPrefs(prev => ({
      ...prev,
      [key]: { ...prev[key], [ch]: !prev[key][ch] },
    }))
    setDirty(true)
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Choose how you want to be notified for each event type.</p>
        <Button
          size="sm"
          disabled={!dirty || save.isPending}
          onClick={() => save.mutate(prefs)}
        >
          {save.isPending ? 'Saving…' : 'Save preferences'}
        </Button>
      </div>

      {GROUPS.map(group => (
        <div key={group} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{group}</span>
            <div className="flex gap-8 text-[10px] text-muted-foreground font-medium uppercase tracking-wide pr-1">
              <span>In-app</span>
              <span>Email</span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {EVENTS.filter(e => e.group === group).map(e => (
              <div key={e.key} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-gray-700">{e.label}</span>
                <div className="flex gap-10 pr-1">
                  {(['in_app', 'email'] as Channel[]).map(ch => (
                    <input
                      key={ch}
                      type="checkbox"
                      checked={prefs[e.key]?.[ch] ?? false}
                      onChange={() => toggle(e.key, ch)}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
