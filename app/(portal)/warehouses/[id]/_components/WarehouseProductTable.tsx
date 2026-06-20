'use client'

import { useState } from 'react'
import {
  useWarehouseProducts,
  useReceiveWarehouseStock,
  useTransferWarehouseStock,
  useAdjustWarehouseStock,
  useSetWarehouseReorderPoint,
  useWarehouses,
} from '@/lib/hooks/useWarehouses'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, Plus, ChevronLeft, ChevronRight, MoreHorizontal,
  ArrowRightLeft, SlidersHorizontal, AlertTriangle, ImageIcon,
  PackagePlus, Scale, X,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'
import type { WarehouseProductStockDto } from '@/lib/types/api'

// ── Category options ──────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { code: '', label: 'All Categories' },
  { code: 'sink',                  label: 'Sinks' },
  { code: 'blade',                 label: 'Blades' },
  { code: 'bit',                   label: 'Router Bits' },
  { code: 'wheel',                 label: 'Grinding Wheels' },
  { code: 'pad',                   label: 'Polishing Pads' },
  { code: 'adhesive',              label: 'Adhesives' },
  { code: 'sealer',                label: 'Sealers' },
  { code: 'cleaner',               label: 'Cleaners' },
  { code: 'edge_profile_template', label: 'Edge Templates' },
  { code: 'backsplash_tile',       label: 'Tile' },
  { code: 'trim',                  label: 'Trim / Molding' },
  { code: 'tool',                  label: 'Hand Tools' },
  { code: 'equipment',             label: 'Equipment' },
  { code: 'other',                 label: 'Other' },
]

const ADJUST_REASONS = ['Physical count', 'Damaged', 'Lost', 'Found', 'Correction', 'Other']

// ── Shared field label ────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-gray-600 mb-1.5">{children}</label>
}

// ── Receive Stock dialog ──────────────────────────────────────────────────────

function ReceiveStockDialog({
  warehouseId,
  open,
  onClose,
}: {
  warehouseId: string
  open: boolean
  onClose: () => void
}) {
  const receive = useReceiveWarehouseStock(warehouseId)
  const [variantId,    setVariantId]    = useState('')
  const [qty,          setQty]          = useState('')
  const [rackLocation, setRackLocation] = useState('')
  const [notes,        setNotes]        = useState('')

  function handleClose() {
    setVariantId(''); setQty(''); setRackLocation(''); setNotes('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-emerald-600" />
            Receive Stock
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <Label>Variant ID</Label>
            <Input
              value={variantId}
              onChange={e => setVariantId(e.target.value)}
              placeholder="Paste product variant UUID…"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Find the variant ID from Inventory → Products → variant row.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantity</Label>
              <Input
                type="number" min={1}
                value={qty}
                onChange={e => setQty(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Rack Location</Label>
              <Input
                value={rackLocation}
                onChange={e => setRackLocation(e.target.value)}
                placeholder="e.g. A-03-2"
              />
            </div>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="PO ref, supplier, delivery note…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>Cancel</Button>
          <Button
            size="sm"
            disabled={receive.isPending || !variantId.trim() || !qty || parseInt(qty) < 1}
            onClick={() =>
              receive.mutate(
                { variantId: variantId.trim(), qty: parseInt(qty), rackLocation: rackLocation || undefined, notes: notes || undefined },
                { onSuccess: handleClose },
              )
            }
          >
            {receive.isPending ? 'Receiving…' : 'Receive Stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Adjust Qty dialog ─────────────────────────────────────────────────────────

function AdjustQtyDialog({
  item,
  warehouseId,
  open,
  onClose,
}: {
  item: WarehouseProductStockDto
  warehouseId: string
  open: boolean
  onClose: () => void
}) {
  const adjust = useAdjustWarehouseStock(warehouseId)
  const [newQty, setNewQty] = useState(String(item.qtyOnHand))
  const [reason, setReason] = useState('Physical count')
  const [notes,  setNotes]  = useState('')

  const delta     = parseInt(newQty || '0') - item.qtyOnHand
  const deltaText = delta > 0 ? `+${delta}` : String(delta)

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-4 h-4" /> Adjust Stock
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <p className="text-xs text-gray-500">{item.variantName} · <span className="font-medium text-gray-700">{item.sku}</span></p>

          {/* Delta preview */}
          <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{item.qtyOnHand}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Current</p>
            </div>
            <div className="text-center flex items-center justify-center">
              <span className="text-gray-300 text-lg">→</span>
            </div>
            <div className="text-center">
              <p className={cn(
                'text-lg font-bold',
                delta > 0 ? 'text-emerald-700' : delta < 0 ? 'text-red-600' : 'text-gray-900',
              )}>
                {newQty || '—'}
              </p>
              <p className={cn(
                'text-[10px] font-semibold uppercase tracking-wide',
                delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-500' : 'text-gray-400',
              )}>
                {delta !== 0 ? deltaText : 'No change'}
              </p>
            </div>
          </div>

          <div>
            <Label>New quantity on hand</Label>
            <Input
              type="number" min={0}
              value={newQty}
              onChange={e => setNewQty(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <Label>Reason</Label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 h-9 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {ADJUST_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional context…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            disabled={adjust.isPending || !newQty || parseInt(newQty) < 0}
            onClick={() =>
              adjust.mutate(
                { variantId: item.variantId, newQtyOnHand: parseInt(newQty), reason, notes: notes || undefined },
                { onSuccess: onClose },
              )
            }
          >
            {adjust.isPending ? 'Saving…' : 'Save Adjustment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Transfer Product dialog ───────────────────────────────────────────────────

function TransferProductDialog({
  item,
  warehouseId,
  open,
  onClose,
}: {
  item: WarehouseProductStockDto
  warehouseId: string
  open: boolean
  onClose: () => void
}) {
  const { data: warehouses }  = useWarehouses()
  const transfer              = useTransferWarehouseStock(warehouseId)
  const [toWarehouseId,   setToWh]  = useState('')
  const [qty,             setQty]   = useState('')
  const [toRack,          setToRack] = useState('')
  const [notes,           setNotes]  = useState('')

  const others    = (warehouses ?? []).filter(w => w.id !== warehouseId && w.isActive)
  const available = item.qtyAvailable

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" /> Transfer Stock
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <p className="text-xs text-gray-500">
            {item.variantName} · Available: <strong className="text-gray-900">{available} {item.unitOfMeasure}</strong>
          </p>

          <div>
            <Label>Destination warehouse</Label>
            <select
              value={toWarehouseId}
              onChange={e => setToWh(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 h-9 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">Select warehouse…</option>
              {others.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantity to transfer</Label>
              <Input
                type="number" min={1} max={available}
                value={qty}
                onChange={e => setQty(e.target.value)}
                placeholder={`Max ${available}`}
              />
            </div>
            <div>
              <Label>Rack at destination</Label>
              <Input
                value={toRack}
                onChange={e => setToRack(e.target.value)}
                placeholder="A-03-2"
              />
            </div>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            disabled={
              transfer.isPending || !toWarehouseId ||
              !qty || parseInt(qty) < 1 || parseInt(qty) > available
            }
            onClick={() =>
              transfer.mutate(
                { variantId: item.variantId, toWarehouseId, qty: parseInt(qty), toRackLocation: toRack || undefined, notes: notes || undefined },
                { onSuccess: onClose },
              )
            }
          >
            {transfer.isPending ? 'Transferring…' : 'Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Reorder Point dialog ──────────────────────────────────────────────────────

function ReorderDialog({
  item,
  warehouseId,
  open,
  onClose,
}: {
  item: WarehouseProductStockDto
  warehouseId: string
  open: boolean
  onClose: () => void
}) {
  const setReorder = useSetWarehouseReorderPoint(warehouseId)
  const [point, setPoint] = useState(item.reorderPoint != null ? String(item.reorderPoint) : '')
  const [qty,   setQty]   = useState(item.reorderQty   != null ? String(item.reorderQty)   : '')

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Reorder Point
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <p className="text-xs text-gray-500">
            {item.variantName} — set the quantity threshold that triggers a low-stock alert.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Alert when below</Label>
              <Input
                type="number" min={0}
                value={point}
                onChange={e => setPoint(e.target.value)}
                placeholder="e.g. 10"
                autoFocus
              />
            </div>
            <div>
              <Label>Suggested order qty</Label>
              <Input
                type="number" min={0}
                value={qty}
                onChange={e => setQty(e.target.value)}
                placeholder="e.g. 50"
              />
            </div>
          </div>

          {point && (
            <p className="text-[11px] text-blue-600 bg-blue-50 rounded-md px-3 py-2">
              A low-stock alert will appear when on-hand qty drops to {point} or below.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            disabled={setReorder.isPending}
            onClick={() =>
              setReorder.mutate(
                { variantId: item.variantId, reorderPoint: point ? parseInt(point) : null, reorderQty: qty ? parseInt(qty) : null },
                { onSuccess: onClose },
              )
            }
          >
            {setReorder.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Row actions ───────────────────────────────────────────────────────────────

type ActiveModal = 'adjust' | 'transfer' | 'reorder' | null

function ProductRowActions({ item, warehouseId }: { item: WarehouseProductStockDto; warehouseId: string }) {
  const [modal, setModal] = useState<ActiveModal>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="gap-2 text-[13px]" onClick={() => setModal('adjust')}>
            <Scale className="w-3.5 h-3.5" /> Adjust Quantity
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-[13px]" onClick={() => setModal('transfer')}>
            <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer to Warehouse
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-[13px]" onClick={() => setModal('reorder')}>
            <SlidersHorizontal className="w-3.5 h-3.5" /> Set Reorder Point
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdjustQtyDialog    item={item} warehouseId={warehouseId} open={modal === 'adjust'}   onClose={() => setModal(null)} />
      <TransferProductDialog item={item} warehouseId={warehouseId} open={modal === 'transfer'} onClose={() => setModal(null)} />
      <ReorderDialog      item={item} warehouseId={warehouseId} open={modal === 'reorder'}  onClose={() => setModal(null)} />
    </>
  )
}

// ── Main table ────────────────────────────────────────────────────────────────

export function WarehouseProductTable({ warehouseId }: { warehouseId: string }) {
  const [search,        setSearch]        = useState('')
  const [categoryCode,  setCategoryCode]  = useState('')
  const [lowStockOnly,  setLowStockOnly]  = useState(false)
  const [page,          setPage]          = useState(1)
  const [receiveOpen,   setReceiveOpen]   = useState(false)

  const PER_PAGE = 50

  const { data, isPending, isError } = useWarehouseProducts(warehouseId, {
    search:       search || undefined,
    categoryCode: categoryCode || undefined,
    lowStockOnly: lowStockOnly || undefined,
    page,
    perPage: PER_PAGE,
  })

  const items      = data?.items      ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const startItem  = Math.min((page - 1) * PER_PAGE + 1, totalCount)
  const endItem    = Math.min(page * PER_PAGE, totalCount)

  return (
    <div className="flex flex-col gap-4">

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="SKU or product name…"
            className="pl-8 h-8 w-48 text-sm border-gray-200"
          />
        </div>

        <select
          value={categoryCode}
          onChange={e => { setCategoryCode(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-md px-2 h-8 text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          {CATEGORY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>

        <button
          onClick={() => { setLowStockOnly(p => !p); setPage(1) }}
          className={cn(
            'flex items-center gap-1.5 px-2.5 h-8 rounded-md border text-[11px] font-medium transition-colors',
            lowStockOnly
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300',
          )}
        >
          <AlertTriangle className="w-3 h-3" />
          Low Stock
        </button>

        {(search || categoryCode || lowStockOnly) && (
          <button
            onClick={() => { setSearch(''); setCategoryCode(''); setLowStockOnly(false); setPage(1) }}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="flex-1" />

        {!isPending && (
          <span className="text-xs text-gray-400">{totalCount} SKU{totalCount !== 1 ? 's' : ''}</span>
        )}

        <Button
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => setReceiveOpen(true)}
        >
          <Plus className="w-3.5 h-3.5" />
          Receive Stock
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-200 hover:bg-gray-50">
              <TableHead className="w-10 text-[10px] text-gray-400 font-semibold uppercase tracking-wide" />
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Product</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Category</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Rack</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide text-right">On Hand</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide text-right">Reserved</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide text-right">Available</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide text-right">Reorder At</TableHead>
              <TableHead className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide text-right">Unit Price</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-gray-100">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 rounded" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : isError
              ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={10} className="text-center py-14 text-sm text-gray-400">
                      Failed to load stock.
                    </TableCell>
                  </TableRow>
                )
              : items.length === 0
              ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={10} className="text-center py-16">
                      <p className="text-sm font-medium text-gray-500">
                        {lowStockOnly ? 'No items below reorder point.' : 'No products stocked here yet.'}
                      </p>
                      {!lowStockOnly && (
                        <p className="text-xs text-gray-400 mt-1">
                          Use "Receive Stock" to add product inventory to this warehouse.
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                )
              : items.map(item => (
                  <TableRow
                    key={item.id}
                    className={cn(
                      'border-gray-100 group hover:bg-gray-50/50',
                      item.isLowStock && 'bg-red-50/30',
                    )}
                  >
                    <TableCell>
                      {item.primaryPhotoUrl
                        ? (
                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                              <img src={item.primaryPhotoUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          )
                        : (
                            <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
                            </div>
                          )}
                    </TableCell>
                    <TableCell>
                      <p className="text-[13px] font-semibold text-gray-900">{item.variantName}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{item.sku}</p>
                    </TableCell>
                    <TableCell>
                      {item.categoryLabel
                        ? (
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-medium">
                              {item.categoryLabel}
                            </Badge>
                          )
                        : <span className="text-gray-300">—</span>}
                    </TableCell>
                    <TableCell className="text-[13px] text-gray-500">
                      {item.rackLocation ?? <span className="text-gray-300">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-[13px] font-semibold text-gray-900">{item.qtyOnHand}</span>
                      <span className="text-[10px] text-gray-400 ml-1">{item.unitOfMeasure}</span>
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-gray-400">
                      {item.qtyReserved}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        'text-[13px] font-semibold',
                        item.isLowStock ? 'text-red-600' : 'text-emerald-700',
                      )}>
                        {item.qtyAvailable}
                      </span>
                      {item.isLowStock && (
                        <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1 align-middle" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.reorderPoint != null
                        ? (
                            <span className={cn(
                              'text-[13px]',
                              item.isLowStock ? 'text-red-600 font-semibold' : 'text-gray-400',
                            )}>
                              {item.reorderPoint}
                            </span>
                          )
                        : <span className="text-gray-300 text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-gray-500">
                      {formatPrice(item.basePrice)}
                    </TableCell>
                    <TableCell className="pr-3">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ProductRowActions item={item} warehouseId={warehouseId} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{startItem}–{endItem} of {totalCount}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm" className="h-7 w-7 p-0 border-gray-200"
              disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs text-gray-500 px-2">{page} / {totalPages}</span>
            <Button
              variant="outline" size="sm" className="h-7 w-7 p-0 border-gray-200"
              disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      <ReceiveStockDialog warehouseId={warehouseId} open={receiveOpen} onClose={() => setReceiveOpen(false)} />
    </div>
  )
}
