import { cn } from '@/lib/utils'
import { STATUS_CONFIG } from '@/lib/utils/constants'
import type { SlabStatus } from '@/lib/types/api'

export function SlabStatusBadge({ status }: { status: SlabStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border', cfg.bg, cfg.color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}
