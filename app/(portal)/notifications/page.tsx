'use client'

import { useState } from 'react'
import { Bell, Settings2 } from 'lucide-react'
import { NotificationInbox } from './_components/NotificationInbox'
import { NotificationPrefsMatrix } from './_components/NotificationPrefsMatrix'
import { useUnreadCount } from '@/lib/hooks/useNotifications'

const TABS = [
  { id: 'inbox',   label: 'Inbox',       icon: Bell },
  { id: 'prefs',   label: 'Preferences', icon: Settings2 },
] as const

type Tab = typeof TABS[number]['id']

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>('inbox')
  const { data: unread } = useUnreadCount()

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="space-y-6">

        <div>
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Stay up to date on orders, connections, and inventory</p>
        </div>

        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === t.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {t.id === 'inbox' && unread && unread.count > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unread.count > 99 ? '99+' : unread.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {tab === 'inbox' && <NotificationInbox />}
        {tab === 'prefs' && <NotificationPrefsMatrix />}
      </div>
    </div>
  )
}
