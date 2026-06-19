'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid, Package, Warehouse, ClipboardList, Handshake,
  DollarSign, BarChart2, Bell, User, Webhook, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CURRENT_DEV_TENANT } from '@/lib/config/devTenants'

const IS_DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === 'true'

// Active tenant — in production this comes from the Clerk session/JWT context.
// In dev it comes from the CURRENT_DEV_TENANT config object.
const tenant = IS_DEV_AUTH
  ? CURRENT_DEV_TENANT
  : { name: 'My Company', userName: '', userEmail: '' }

const NAV = [
  {
    section: 'Operations',
    items: [
      { href: '/inventory',  label: 'Inventory',   icon: LayoutGrid },
      { href: '/bundles',    label: 'Bundles',      icon: Package },
      { href: '/warehouses', label: 'Warehouses',   icon: Warehouse },
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

  // Initials from tenant name
  const initials = tenant.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <aside className="w-52 shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Logo + tenant switcher */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">SB</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">StoneBridge</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-between px-2 text-gray-600 font-medium"
        >
          <span className="truncate text-xs">{tenant.name}</span>
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

      {/* Footer — current user */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-100">
        {IS_DEV_AUTH && (
          <div className="mb-2 px-1 py-1 rounded bg-amber-50 border border-amber-100 text-[10px] text-amber-700 font-medium text-center tracking-wide">
            DEV AUTH
          </div>
        )}
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-700 truncate">{tenant.userName}</div>
            <div className="text-[10px] text-gray-400 truncate">{tenant.userEmail}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
