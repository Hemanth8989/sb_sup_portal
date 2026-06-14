import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SlabStatus } from '@/lib/types/api'

const STATUS: Record<SlabStatus, { label: string; cls: string; dot: string }> = {
  available: { label: 'Available', cls: 'bg-green-50 text-green-700 border-green-100',   dot: 'bg-green-500' },
  reserved:  { label: 'Reserved',  cls: 'bg-amber-50 text-amber-700 border-amber-100',   dot: 'bg-amber-400' },
  hold:      { label: 'Hold',      cls: 'bg-red-50 text-red-600 border-red-100',         dot: 'bg-red-400' },
  allocated: { label: 'Allocated', cls: 'bg-blue-50 text-blue-700 border-blue-100',      dot: 'bg-blue-400' },
  shipped:   { label: 'Shipped',   cls: 'bg-purple-50 text-purple-700 border-purple-100',dot: 'bg-purple-400' },
  sold:      { label: 'Sold',      cls: 'bg-muted text-muted-foreground border-border',  dot: 'bg-gray-400' },
}

export function SlabStatusBadge({ status }: { status: SlabStatus }) {
  const s = STATUS[status]
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', s.cls)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
      {s.label}
    </Badge>
  )
}
