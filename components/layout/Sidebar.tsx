'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid, Package, Warehouse, ClipboardList, Handshake,
  DollarSign, BarChart2, Bell, User, Webhook, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV = [
  {
    section: 'Operations',
    items: [
      { href: '/inventory',   label: 'Inventory',        icon: LayoutGrid },
      { href: '/bundles',     label: 'Bundles',          icon: Package },
      { href: '/warehouses',  label: 'Warehouses',       icon: Warehouse },
    ],
  },
  {
    section: 'Sales',
    items: [
      { href: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardList, badge: 3 },
      { href: '/connections',     label: 'Connections',     icon: Handshake,     badge: 2 },
      { href: '/price-lists',     label: 'Price Lists',     icon: DollarSign },
    ],
  },
  {
    section: 'Insights',
    items: [
      { href: '/analytics',     label: 'Analytics',     icon: BarChart2 },
      { href: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    section: 'Settings',
    items: [
      { href: '/profile',  label: 'Profile',  icon: User },
      { href: '/webhooks', label: 'Webhooks', icon: Webhook },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-52 shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">SB</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">StoneBridge</span>
        </div>
        <Button variant="ghost" size="sm" className="mt-2 w-full justify-between px-2 text-gray-600 font-medium">
          <span className="truncate text-xs">Supplier Account</span>
          <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV.map(group => (
          <div key={group.section}>
            <p className="px-2 mb-1 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] transition-colors',
                      active
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                    <span className="flex-1">{item.label}</span>
                    {'badge' in item && item.badge != null && (
                      <span className="bg-gray-900 text-white text-[10px] font-semibold rounded-full px-1.5 py-px leading-none">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
            S
          </div>
          <span className="text-xs text-gray-500 truncate">supplier@stone.com</span>
        </div>
      </div>
    </aside>
  )
}
