'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useWarehouses, useTransferSlabs } from '@/lib/hooks/useWarehouses'

interface Props {
  open: boolean
  onClose: () => void
  warehouseId: string
  selectedSlabIds: string[]
  onSuccess: () => void
}

export function TransferSlabsModal({ open, onClose, warehouseId, selectedSlabIds, onSuccess }: Props) {
  const { data: warehouses }  = useWarehouses()
  const transfer              = useTransferSlabs(warehouseId)
  const [targetId, setTarget] = useState<string | null>(null)
  const [rack, setRack]       = useState('')

  const targets = warehouses?.filter(w => w.id !== warehouseId && w.isActive) ?? []

  const handleTransfer = async () => {
    if (!targetId) return
    await transfer.mutateAsync({
      slabIds:           selectedSlabIds,
      targetWarehouseId: targetId!,
      rackLocation:      rack || undefined,
    })
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Transfer Slabs</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <p className="text-sm text-muted-foreground">
            Moving <span className="font-semibold text-foreground">{selectedSlabIds.length}</span> slab{selectedSlabIds.length !== 1 ? 's' : ''} to another warehouse.
          </p>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Destination warehouse *</label>
            <Select value={targetId} onValueChange={setTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Select warehouse…" />
              </SelectTrigger>
              <SelectContent>
                {targets.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Rack / location (optional)</label>
            <Input value={rack} onChange={e => setRack(e.target.value)} placeholder="A-12" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={transfer.isPending}>Cancel</Button>
          <Button onClick={handleTransfer} disabled={!targetId || transfer.isPending}>
            {transfer.isPending ? 'Transferring…' : 'Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
