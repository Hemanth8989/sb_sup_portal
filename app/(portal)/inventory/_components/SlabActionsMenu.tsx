'use client'

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, PauseCircle, PlayCircle, Trash2, ImageIcon } from 'lucide-react'
import { useUpdateSlabStatus, useDeleteSlab } from '@/lib/hooks/useSupplierSlabs'
import type { SupplierSlabDto } from '@/lib/types/api'

export function SlabActionsMenu({ slab }: { slab: SupplierSlabDto }) {
  const updateStatus = useUpdateSlabStatus()
  const deleteSlab   = useDeleteSlab()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem className="gap-2 text-[13px]">
          <Pencil className="w-3.5 h-3.5" /> Edit Details
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-[13px]">
          <ImageIcon className="w-3.5 h-3.5" /> Manage Photos
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {slab.status === 'available' && (
          <DropdownMenuItem
            className="gap-2 text-[13px]"
            onClick={() => updateStatus.mutate({ slabId: slab.id, status: 'hold' })}
          >
            <PauseCircle className="w-3.5 h-3.5 text-amber-500" /> Put on Hold
          </DropdownMenuItem>
        )}
        {slab.status === 'hold' && (
          <DropdownMenuItem
            className="gap-2 text-[13px]"
            onClick={() => updateStatus.mutate({ slabId: slab.id, status: 'available' })}
          >
            <PlayCircle className="w-3.5 h-3.5 text-green-500" /> Release Hold
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-[13px] text-destructive focus:text-destructive"
          onClick={() => {
            if (confirm(`Delete slab ${slab.internalRef}?`)) deleteSlab.mutate(slab.id)
          }}
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
