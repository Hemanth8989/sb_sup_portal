'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdatePriceList } from '@/lib/hooks/usePriceLists'
import type { PriceListDetailDto } from '@/lib/types/api'

const TIERS = ['standard', 'preferred', 'vip'] as const
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const

interface Props {
  pl: PriceListDetailDto
  open: boolean
  onClose: () => void
}

export function EditPriceListSheet({ pl, open, onClose }: Props) {
  const update = useUpdatePriceList()

  const [name,      setName]      = useState(pl.name)
  const [tier,      setTier]      = useState(pl.tier)
  const [currency,  setCurrency]  = useState(pl.currency)
  const [validFrom, setValidFrom] = useState(pl.validFrom ?? '')
  const [validTo,   setValidTo]   = useState(pl.validTo ?? '')
  const [isActive,  setIsActive]  = useState(pl.isActive)

  useEffect(() => {
    if (open) {
      setName(pl.name)
      setTier(pl.tier)
      setCurrency(pl.currency)
      setValidFrom(pl.validFrom ?? '')
      setValidTo(pl.validTo ?? '')
      setIsActive(pl.isActive)
    }
  }, [open, pl])

  function handleSave() {
    update.mutate(
      { id: pl.id, body: { name, description: undefined, tier, currency, isActive } },
      { onSuccess: onClose },
    )
  }

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) { onClose() } }}>
      <SheetContent className="w-[400px] flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-4 border-b border-gray-100">
          <SheetTitle className="text-sm font-semibold">Edit Price List</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="h-8 text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tier</Label>
            <div className="flex gap-2">
              {TIERS.map(t => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize ${
                    tier === t
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Currency</Label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                    currency === c
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Valid From</Label>
              <Input
                type="date"
                value={validFrom}
                onChange={e => setValidFrom(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Valid To</Label>
              <Input
                type="date"
                value={validTo}
                onChange={e => setValidTo(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Active</p>
              <p className="text-xs text-muted-foreground">Inactive lists are hidden from fabricators</p>
            </div>
            <button
              onClick={() => setIsActive(v => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-gray-900' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!name.trim() || update.isPending} onClick={handleSave}>
            {update.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
