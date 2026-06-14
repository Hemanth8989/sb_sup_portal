'use client'

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, PauseCircle, PlayCircle, Trash2, Image } from 'lucide-react'
import { useUpdateSlabStatus, useDeleteSlab } from '@/lib/hooks/useSupplierSlabs'
import type { SupplierSlabDto } from '@/lib/types/api'

export function SlabActionsMenu({ slab }: { slab: SupplierSlabDto }) {
  const updateStatus = useUpdateSlabStatus()
  const deleteSlab   = useDeleteSlab()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem className="text-xs gap-2">
          <Pencil className="w-3.5 h-3.5" /> Edit Details
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs gap-2">
          <Image className="w-3.5 h-3.5" /> Manage Photos
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {slab.status === 'available' && (
          <DropdownMenuItem
            className="text-xs gap-2"
            onClick={() => updateStatus.mutate({ slabId: slab.id, status: 'hold' })}
          >
            <PauseCircle className="w-3.5 h-3.5 text-red-500" /> Put on Hold
          </DropdownMenuItem>
        )}
        {slab.status === 'hold' && (
          <DropdownMenuItem
            className="text-xs gap-2"
            onClick={() => updateStatus.mutate({ slabId: slab.id, status: 'available' })}
          >
            <PlayCircle className="w-3.5 h-3.5 text-green-500" /> Release Hold
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-xs gap-2 text-red-600 focus:text-red-600"
          onClick={() => {
            if (confirm(`Delete slab ${slab.internalRef}?`)) {
              deleteSlab.mutate(slab.id)
            }
          }}
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
