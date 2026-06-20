'use client'

import { useState, useMemo } from 'react'
import { Trash2, Search, Check, X, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUpsertPriceListItem, useRemovePriceListItem } from '@/lib/hooks/usePriceLists'
import { formatPrice } from '@/lib/utils/formatters'
import type { PriceListDetailDto, PriceListItemDto } from '@/lib/types/api'

interface Props {
  pl: PriceListDetailDto
}

function InlinePrice({ item, listId }: { item: PriceListItemDto; listId: string }) {
  const [editing, setEditing] = useState(false)
  const [value,   setValue]   = useState(item.unitPrice.toFixed(2))
  const upsert = useUpsertPriceListItem()

  function save() {
    const parsed = parseFloat(value)
    if (isNaN(parsed) || parsed < 0) { setEditing(false); setValue(item.unitPrice.toFixed(2)); return }
    upsert.mutate(
      { id: listId, body: { variantId: item.variantId, unitPrice: parsed } },
      { onSuccess: () => setEditing(false) },
    )
  }

  function cancel() {
    setValue(item.unitPrice.toFixed(2))
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 justify-end">
        <div className="relative w-24">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
          <Input
            autoFocus
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { save() } else if (e.key === 'Escape') { cancel() } }}
            className="pl-5 h-7 text-xs text-right"
          />
        </div>
        <button onClick={save} disabled={upsert.isPending} className="text-green-600 hover:text-green-700">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={cancel} className="text-muted-foreground hover:text-gray-700">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="tabular-nums font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
      title="Click to edit"
    >
      {upsert.isPending ? '…' : formatPrice(item.unitPrice)}
    </button>
  )
}

export function PriceListItemsTable({ pl }: Props) {
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkPct,  setBulkPct]  = useState('')
  const [showBulk, setShowBulk] = useState(false)
  const removeItem = useRemovePriceListItem()
  const upsert     = useUpsertPriceListItem()

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) { return pl.items }
    return pl.items.filter(i =>
      i.variantName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q),
    )
  }, [pl.items, search])

  function toggleRow(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(i => i.id)))
    }
  }

  function deleteSelected() {
    selected.forEach(itemId => removeItem.mutate({ id: pl.id, itemId }))
    setSelected(new Set())
  }

  async function applyBulkPct() {
    const pct = parseFloat(bulkPct)
    if (isNaN(pct)) { return }
    const multiplier = 1 + pct / 100
    const items = pl.items.filter(i => selected.size === 0 || selected.has(i.id))
    await Promise.all(
      items.map(i =>
        upsert.mutateAsync({
          id:   pl.id,
          body: { variantId: i.variantId, unitPrice: Math.max(0, parseFloat((i.unitPrice * multiplier).toFixed(2))) },
        }),
      ),
    )
    setBulkPct('')
    setShowBulk(false)
    setSelected(new Set())
  }

  if (pl.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border border-dashed border-gray-200 rounded-xl text-sm text-muted-foreground gap-2">
        <p>No items yet. Use "Add Items" to populate this price list.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            className="pl-8 h-8 text-sm"
          />
        </div>

        {selected.size > 0 && (
          <>
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowBulk(v => !v)}>
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              % Change
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-red-500 hover:text-red-700"
              disabled={removeItem.isPending}
              onClick={deleteSelected}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          </>
        )}

        {showBulk && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
            <span className="text-xs text-muted-foreground">
              {selected.size === 0 ? 'All items' : `${selected.size} items`}
            </span>
            <div className="relative w-24">
              <Input
                type="number"
                step="0.1"
                value={bulkPct}
                onChange={e => setBulkPct(e.target.value)}
                placeholder="e.g. 10"
                className="h-7 text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
            <Button size="sm" className="h-7 text-xs" disabled={!bulkPct || upsert.isPending} onClick={applyBulkPct}>
              Apply
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowBulk(false)}>
              Cancel
            </Button>
          </div>
        )}

        {selected.size === 0 && !showBulk && pl.items.length > 1 && (
          <Button size="sm" variant="outline" className="h-8 text-xs ml-auto" onClick={() => setShowBulk(true)}>
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Bulk % Change
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer"
                />
              </th>
              <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Product / Variant</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">SKU</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Unit Price</th>
              <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Currency</th>
              <th className="w-12 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(item => (
              <tr
                key={item.id}
                className={`group transition-colors ${selected.has(item.id) ? 'bg-blue-50' : 'hover:bg-gray-50/50'}`}
              >
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleRow(item.id)}
                    className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-2.5 font-medium text-gray-900">{item.variantName}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{item.sku}</td>
                <td className="px-4 py-2.5 text-right">
                  <InlinePrice item={item} listId={pl.id} />
                </td>
                <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{item.currency}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                    disabled={removeItem.isPending}
                    onClick={() => removeItem.mutate({ id: pl.id, itemId: item.id })}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No items match your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/50 text-[11px] text-muted-foreground">
          {filtered.length} of {pl.items.length} items
        </div>
      </div>
    </div>
  )
}
