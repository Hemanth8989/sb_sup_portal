'use client'

import type { AnalyticsRange } from '@/lib/types/api'

const OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: '7d',   label: '7 days' },
  { value: '30d',  label: '30 days' },
  { value: '90d',  label: '90 days' },
  { value: '365d', label: '1 year' },
]

export function RangePicker({
  value,
  onChange,
}: {
  value: AnalyticsRange
  onChange: (r: AnalyticsRange) => void
}) {
  return (
    <div className="flex gap-1 p-0.5 rounded-lg bg-gray-100 text-xs">
      {OPTIONS.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1 rounded-md transition-colors font-medium ${
            value === o.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
