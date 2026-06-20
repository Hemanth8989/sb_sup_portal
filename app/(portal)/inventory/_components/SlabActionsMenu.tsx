'use client'

import { useState } from 'react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, PauseCircle, PlayCircle, Trash2, DollarSign } from 'lucide-react'
import { useUpdateSlabStatus, useDeleteSlab, useSetSlabPrice } from '@/lib/hooks/useSupplierSlabs'
import type { SupplierSlabDto } from '@/lib/types/api'
import { AddSlabSheet } from './AddSlabSheet'

function SetPriceDialog({ slab, onClose }: { slab: SupplierSlabDto; onClose: () => void }) {
  const setPrice = useSetSlabPrice()
  const [value, setValue] = useState(slab.priceOverride != null ? String(slab.priceOverride) : '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-80 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Set Price Override</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Slab {slab.internalRef} · Base: ${slab.basePrice?.toFixed(2) ?? '—'}/sqft</p>
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">Price ($/sqft) — leave blank to use base price</label>
          <input
            autoFocus
            type="number"
            step="0.01"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="e.g. 45.00"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={setPrice.isPending}
            onClick={() => {
              const price = value.trim() ? parseFloat(value) : null
              setPrice.mutate({ slabId: slab.id, price }, { onSuccess: onClose })
            }}
          >
            {setPrice.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SlabActionsMenu({ slab }: { slab: SupplierSlabDto }) {
  const updateStatus = useUpdateSlabStatus()
  const deleteSlabMut = useDeleteSlab()
  const [editOpen,  setEditOpen]  = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="gap-2 text-[13px]" onClick={() => setEditOpen(true)}>
            <Pencil className="w-3.5 h-3.5" /> Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-[13px]" onClick={() => setPriceOpen(true)}>
            <DollarSign className="w-3.5 h-3.5" /> Set Price
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
              if (confirm(`Delete slab ${slab.internalRef}?`)) { deleteSlabMut.mutate(slab.id) }
            }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddSlabSheet open={editOpen} onClose={() => setEditOpen(false)} editing={slab} />
      {priceOpen && <SetPriceDialog slab={slab} onClose={() => setPriceOpen(false)} />}
    </>
  )
}
