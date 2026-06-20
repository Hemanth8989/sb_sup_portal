'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Check } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useProductInventory } from '@/lib/hooks/useProductInventory'
import { useUpsertPriceListItem } from '@/lib/hooks/usePriceLists'
import { formatPrice } from '@/lib/utils/formatters'
import type { PriceListDetailDto, ProductVariantInventoryDto } from '@/lib/types/api'

interface Props {
  pl: PriceListDetailDto
  open: boolean
  onClose: () => void
}

interface SelectedVariant {
  variant: ProductVariantInventoryDto
  productName: string
  price: string
}

export function AddItemsSheet({ pl, open, onClose }: Props) {
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<SelectedVariant[]>([])
  const upsert = useUpsertPriceListItem()

  const { data, isPending } = useProductInventory({
    search: search || undefined,
    status: 'active',
    perPage: 100,
  })

  const existingVariantIds = useMemo(
    () => new Set(pl.items.map(i => i.variantId)),
    [pl.items],
  )

  const products = data?.items ?? []

  function toggleVariant(variant: ProductVariantInventoryDto, productName: string) {
    setSelected(prev => {
      const idx = prev.findIndex(s => s.variant.id === variant.id)
      if (idx >= 0) { return prev.filter((_, i) => i !== idx) }
      return [...prev, { variant, productName, price: variant.basePrice.toFixed(2) }]
    })
  }

  function setPrice(variantId: string, price: string) {
    setSelected(prev => prev.map(s => s.variant.id === variantId ? { ...s, price } : s))
  }

  async function handleAdd() {
    await Promise.all(
      selected.map(s =>
        upsert.mutateAsync({
          id:   pl.id,
          body: { variantId: s.variant.id, unitPrice: parseFloat(s.price) || 0 },
        }),
      ),
    )
    setSelected([])
    onClose()
  }

  function handleClose() {
    setSelected([])
    setSearch('')
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) { handleClose() } }}>
      <SheetContent className="w-[520px] flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-4 border-b border-gray-100">
          <SheetTitle className="text-sm font-semibold">Add Items to Price List</SheetTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Search your product catalog and set custom prices</p>
        </SheetHeader>

        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto">
          {isPending
            ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              )
            : products.length === 0
              ? (
                  <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                    No products found
                  </div>
                )
              : (
                  <div className="divide-y divide-gray-50">
                    {products.flatMap(p =>
                      p.variants.map(v => {
                        const alreadyAdded = existingVariantIds.has(v.id)
                        const sel = selected.find(s => s.variant.id === v.id)
                        const isSelected = !!sel

                        return (
                          <div
                            key={v.id}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                              alreadyAdded ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                            } ${isSelected ? 'bg-blue-50' : ''}`}
                            onClick={() => { if (!alreadyAdded) { toggleVariant(v, p.name) } }}
                          >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{v.sku} · {v.unitOfMeasure}</p>
                            </div>

                            <div className="text-right shrink-0">
                              {alreadyAdded
                                ? <span className="text-[10px] text-green-600 font-medium">Already added</span>
                                : (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Base</p>
                                      <p className="text-sm font-medium">{formatPrice(v.basePrice)}</p>
                                    </div>
                                  )}
                            </div>
                          </div>
                        )
                      }),
                    )}
                  </div>
                )}
        </div>

        {/* Selected items price override */}
        {selected.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 space-y-2 max-h-52 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-700 mb-2">Set prices ({pl.currency})</p>
            {selected.map(s => (
              <div key={s.variant.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{s.productName}</p>
                  <p className="text-[10px] text-muted-foreground">{s.variant.sku}</p>
                </div>
                <div className="relative w-28 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={s.price}
                    onChange={e => setPrice(s.variant.id, e.target.value)}
                    className="pl-6 h-7 text-xs text-right"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {selected.length > 0 ? `${selected.length} variant${selected.length > 1 ? 's' : ''} selected` : 'Select variants above'}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClose}>Cancel</Button>
            <Button
              size="sm"
              disabled={selected.length === 0 || upsert.isPending}
              onClick={handleAdd}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              {upsert.isPending ? 'Adding…' : `Add ${selected.length > 0 ? selected.length : ''} Item${selected.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
