'use client'

import { useMemo } from 'react'
import { ImageIcon, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { BundleSlabDto } from '@/lib/types/api'
import { formatSqft, formatDimensions } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

const STATUS_STYLE: Record<string, string> = {
  available: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  reserved:  'bg-amber-50  border-amber-200  text-amber-800',
  hold:      'bg-blue-50   border-blue-200   text-blue-800',
  allocated: 'bg-purple-50 border-purple-200 text-purple-800',
  sold:      'bg-gray-50   border-gray-200   text-gray-400',
  shipped:   'bg-gray-50   border-gray-200   text-gray-400',
}

interface Props {
  slabs: BundleSlabDto[]
}

export function BundleSlabGrid({ slabs }: Props) {
  // Detect bookmatched pairs: slabs sharing a block_number
  const pairBlocks = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of slabs) {
      if (s.blockNumber) counts.set(s.blockNumber, (counts.get(s.blockNumber) ?? 0) + 1)
    }
    return new Set([...counts.entries()].filter(([, n]) => n >= 2).map(([k]) => k))
  }, [slabs])

  if (slabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No slabs in this bundle yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {slabs.map(s => {
        const isPair = s.blockNumber && pairBlocks.has(s.blockNumber)
        return (
          <div
            key={s.id}
            className={cn(
              'rounded-lg border p-3 flex flex-col gap-2 text-xs',
              STATUS_STYLE[s.status] ?? 'bg-gray-50 border-gray-200',
            )}
          >
            {/* Photo */}
            <div className="w-full aspect-[4/3] rounded bg-black/5 overflow-hidden flex items-center justify-center">
              {s.primaryPhotoUrl ? (
                <img src={s.primaryPhotoUrl} alt={s.internalRef} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
              )}
            </div>

            {/* Ref + status */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-mono font-semibold text-[11px] truncate flex-1">{s.internalRef}</span>
              {isPair && (
                <Tooltip>
                  <TooltipTrigger>
                    <span className="inline-flex items-center">
                      <Layers className="w-3 h-3 text-violet-600" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Bookmatched pair — Block {s.blockNumber}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Dims */}
            <div className="text-muted-foreground leading-tight">
              <div>{formatDimensions(s.grossLengthMm, s.grossWidthMm)}</div>
              <div>{formatSqft(s.netSqft)} · {s.finish}</div>
            </div>

            {/* Status badge */}
            <Badge
              variant="outline"
              className="capitalize text-[10px] py-0.5 self-start border-0 bg-white/60 backdrop-blur-sm"
            >
              {s.status}
            </Badge>

            {s.rackLocation && (
              <div className="text-[10px] text-muted-foreground">📍 {s.rackLocation}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
