'use client'

import { useState } from 'react'
import { useAdjustStock } from '@/lib/hooks/useProductInventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProductVariantInventoryDto } from '@/lib/types/api'

interface Props {
  variant:  ProductVariantInventoryDto
  onClose:  () => void
}

export function StockAdjustModal({ variant, onClose }: Props) {
  const adjust   = useAdjustStock()
  const [delta,  setDelta]  = useState<string>('')
  const [reason, setReason] = useState('')
  const [newPrice, setNewPrice] = useState<string>('')

  const parsedDelta = parseInt(delta, 10)
  const parsedPrice = newPrice !== '' ? parseFloat(newPrice) : undefined

  const previewQty = isNaN(parsedDelta) ? variant.qtyAvailable : variant.qtyAvailable + parsedDelta
  const willGoNegative = !isNaN(parsedDelta) && previewQty < 0

  const handleSubmit = () => {
    if (isNaN(parsedDelta) || parsedDelta === 0) return
    adjust.mutate(
      { variantId: variant.id, body: { delta: parsedDelta, newPrice: parsedPrice, reason: reason || undefined } },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Adjust Stock</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{variant.variantName} · {variant.sku}</p>
        </div>

        {/* Current qty display */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-2xl font-bold tabular-nums">{variant.qtyAvailable}</p>
          </div>
          <div className="text-2xl text-muted-foreground">→</div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">After</p>
            <p className={`text-2xl font-bold tabular-nums ${willGoNegative ? 'text-red-500' : 'text-gray-900'}`}>
              {isNaN(parsedDelta) ? '–' : previewQty}
            </p>
          </div>
        </div>

        <div>
          <Label>Quantity Change *</Label>
          <p className="text-xs text-muted-foreground mb-1">Use positive to receive stock, negative to write off.</p>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              className="w-8 h-8 rounded border text-lg font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center"
              onClick={() => setDelta(d => String((parseInt(d, 10) || 0) - 1))}
            >−</button>
            <Input
              type="number"
              value={delta}
              onChange={e => setDelta(e.target.value)}
              className="text-center font-mono"
              placeholder="0"
            />
            <button
              type="button"
              className="w-8 h-8 rounded border text-lg font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center"
              onClick={() => setDelta(d => String((parseInt(d, 10) || 0) + 1))}
            >+</button>
          </div>
          {willGoNegative && (
            <p className="text-xs text-red-500 mt-1">Stock cannot go below zero.</p>
          )}
        </div>

        <div>
          <Label htmlFor="newPrice">New Price (optional)</Label>
          <Input
            id="newPrice"
            type="number"
            step="0.01"
            min="0"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            placeholder={`Current: $${variant.basePrice.toFixed(2)}`}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="reason">Reason</Label>
          <Input
            id="reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Received shipment, Write-off damage"
            className="mt-1"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            className="flex-1"
            disabled={adjust.isPending || isNaN(parsedDelta) || parsedDelta === 0 || willGoNegative}
            onClick={handleSubmit}
          >
            {adjust.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
