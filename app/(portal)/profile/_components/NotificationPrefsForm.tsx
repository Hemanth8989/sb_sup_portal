'use client'

import { useNotificationPrefs, useUpdateNotificationPrefs } from '@/lib/hooks/useSupplierProfile'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import type { NotificationPrefs, NotificationChannel } from '@/lib/types/profile'

const EVENTS: { key: keyof NotificationPrefs; label: string; sub: string }[] = [
  { key: 'new_po',              label: 'New purchase order',       sub: 'A fabricator sends you a PO' },
  { key: 'po_unacked_24h',      label: 'PO unacknowledged 24h',    sub: 'SLA warning — action required' },
  { key: 'connection_requested',label: 'Connection requested',      sub: 'A fabricator wants catalog access' },
  { key: 'connection_approved', label: 'Connection approved',       sub: 'Your approval was confirmed' },
  { key: 'price_changed',       label: 'Price list expiring',       sub: '7 days before valid_to date' },
  { key: 'low_stock_warning',   label: 'Low stock warning',         sub: 'Fewer than 5 available slabs' },
]

const CHANNELS: { key: NotificationChannel; label: string }[] = [
  { key: 'inApp', label: 'In-app' },
  { key: 'email', label: 'Email' },
  { key: 'sms',   label: 'SMS' },
]

export function NotificationPrefsForm() {
  const { data: prefs, isPending } = useNotificationPrefs()
  const update = useUpdateNotificationPrefs()

  function toggle(eventKey: keyof NotificationPrefs, channel: NotificationChannel) {
    if (!prefs) return
    const updated: NotificationPrefs = {
      ...prefs,
      [eventKey]: { ...prefs[eventKey], [channel]: !prefs[eventKey][channel] },
    }
    update.mutate(updated)
  }

  return (
    <Card className="shadow-sm" id="notifications">
      <CardContent>
        <div className="mb-4">
          <h2 className="text-sm font-medium text-foreground">Notification preferences</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose how you receive alerts for each event. Changes save instantly.
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[420px]">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_72px_72px_72px] gap-2 mb-1 px-1">
              <div />
              {CHANNELS.map(c => (
                <div key={c.key} className="text-[11px] font-medium text-muted-foreground text-center">
                  {c.label}
                </div>
              ))}
            </div>

            <Separator className="mb-1" />

            {isPending
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[1fr_72px_72px_72px] gap-2 py-3 border-b border-border/50 last:border-0">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-40 rounded" />
                      <Skeleton className="h-3 w-52 rounded" />
                    </div>
                    <Skeleton className="h-5 w-9 rounded-full mx-auto" />
                    <Skeleton className="h-5 w-9 rounded-full mx-auto" />
                    <Skeleton className="h-5 w-9 rounded-full mx-auto" />
                  </div>
                ))
              : EVENTS.map((event, idx) => (
                  <div
                    key={event.key}
                    className={`grid grid-cols-[1fr_72px_72px_72px] gap-2 items-center py-3 ${idx < EVENTS.length - 1 ? 'border-b border-border/40' : ''}`}
                  >
                    <div>
                      <p className="text-[13px] text-foreground">{event.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{event.sub}</p>
                    </div>
                    {CHANNELS.map(channel => (
                      <div key={channel.key} className="flex justify-center">
                        <Switch
                          checked={prefs?.[event.key]?.[channel.key] ?? false}
                          onCheckedChange={() => toggle(event.key, channel.key)}
                          disabled={update.isPending}
                          aria-label={`${event.label} ${channel.label}`}
                        />
                      </div>
                    ))}
                  </div>
                ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
