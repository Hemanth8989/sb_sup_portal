'use client'

import { cn } from '@/lib/utils'
import { Building2, Globe, BarChart2, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'

const SECTIONS = [
  { id: 'business',      label: 'Business info',  icon: Building2 },
  { id: 'public',        label: 'Public profile', icon: Globe },
  { id: 'performance',   label: 'Performance',    icon: BarChart2 },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
]

export function ProfileNav() {
  const [active, setActive] = useState('business')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    )

    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActive(id)
    }
  }

  return (
    <nav className="sticky top-4 space-y-0.5">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-2 py-1.5">
        Profile
      </p>
      {SECTIONS.map(s => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors text-left',
            active === s.id
              ? 'bg-secondary text-foreground font-medium'
              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
          )}
        >
          <s.icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          {s.label}
        </button>
      ))}
    </nav>
  )
}
