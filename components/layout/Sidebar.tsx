'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid, Package, Warehouse, ClipboardList, Handshake,
  DollarSign, BarChart2, Bell, User, Webhook,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  {
    section: 'Operations',
    items: [
      { href: '/inventory',   label: 'Inventory',        icon: LayoutGrid,    badge: null },
      { href: '/bundles',     label: 'Bundles',          icon: Package,       badge: null },
      { href: '/warehouses',  label: 'Warehouses',       icon: Warehouse,     badge: null },
    ],
  },
  {
    section: 'Sales',
    items: [
      { href: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardList, badge: 3 },
      { href: '/connections',     label: 'Connections',     icon: Handshake,     badge: 2 },
      { href: '/price-lists',     label: 'Price Lists',     icon: DollarSign,    badge: null },
    ],
  },
  {
    section: 'Insights',
    items: [
      { href: '/analytics',      label: 'Analytics',      icon: BarChart2, badge: null },
      { href: '/notifications',  label: 'Notifications',  icon: Bell,      badge: null },
    ],
  },
  {
    section: 'Settings',
    items: [
      { href: '/profile',   label: 'Profile',   icon: User,    badge: null },
      { href: '/webhooks',  label: 'Webhooks',  icon: Webhook, badge: null },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-slate-900 flex flex-col h-full">
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="text-white font-bold text-base tracking-tight">⬡ StoneBridge</div>
        <div className="text-slate-500 text-[10px] uppercase tracking-widest mt-0.5">Supplier Portal</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map(group => (
          <div key={group.section} className="mb-2">
            <div className="px-4 py-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
              {group.section}
            </div>
            {group.items.map(item => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-2 text-[12px] border-l-2 transition-colors',
                    active
                      ? 'text-slate-100 bg-slate-800 border-indigo-500'
                      : 'text-slate-400 border-transparent hover:text-slate-300 hover:bg-slate-800/50',
                  )}
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && (
                    <span className="bg-indigo-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-px">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
