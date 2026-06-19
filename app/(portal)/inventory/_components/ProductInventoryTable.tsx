'use client'

import { useState } from 'react'
import {
  ChevronDown, ChevronRight, Plus, Pencil, Trash2,
  AlertTriangle, TrendingDown, Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StockAdjustModal } from './StockAdjustModal'
import { useDeactivateProduct } from '@/lib/hooks/useProductInventory'
import type { ProductInventoryDto, ProductVariantInventoryDto } from '@/lib/types/api'

const STATUS_COLOR: Record<string, string> = {
  active:        'bg-green-50 text-green-700',
  out_of_stock:  'bg-red-50 text-red-600',
  discontinued:  'bg-gray-100 text-gray-500',
}

function StockIndicator({ qty }: { qty: number }) {
  if (qty === 0) return <span className="flex items-center gap-1 text-red-500 text-xs font-medium"><AlertTriangle className="w-3 h-3" />Out of stock</span>
  if (qty <= 2)  return <span className="flex items-center gap-1 text-orange-500 text-xs font-medium"><TrendingDown className="w-3 h-3" />Low — {qty}</span>
  return <span className="text-sm tabular-nums font-medium">{qty}</span>
}

interface VariantRowProps {
  variant:   ProductVariantInventoryDto
  onEdit:    () => void
  onAdjust:  (v: ProductVariantInventoryDto) => void
}

function VariantRow({ variant, onEdit, onAdjust }: VariantRowProps) {
  return (
    <tr className="hover:bg-gray-50/60 group">
      <td className="pl-10 pr-4 py-2.5">
        <div>
          <p className="text-sm font-medium text-gray-800">{variant.variantName}</p>
          <p className="text-xs text-muted-foreground font-mono">{variant.sku}</p>
        </div>
      </td>
      <td className="px-4 py-2.5 text-xs text-muted-foreground">{variant.unitOfMeasure}</td>
      <td className="px-4 py-2.5">
        <StockIndicator qty={variant.qtyAvailable} />
      </td>
      <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums">
        {variant.qtyReserved > 0 ? variant.qtyReserved : '—'}
      </td>
      <td className="px-4 py-2.5 text-sm tabular-nums">
        ${variant.basePrice.toFixed(2)}
      </td>
      <td className="px-4 py-2.5">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_COLOR[variant.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {variant.status.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="px-4 py-2.5 text-xs text-muted-foreground">
        {variant.leadTimeDays != null ? `${variant.leadTimeDays}d` : '—'}
      </td>
      <td className="px-4 py-2.5 text-right">
        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1 rounded hover:bg-gray-100 text-muted-foreground hover:text-gray-900"
            title="Adjust stock"
            onClick={() => onAdjust(variant)}
          >
            <Package className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 text-muted-foreground hover:text-gray-900"
            title="Edit"
            onClick={onEdit}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

interface ProductRowProps {
  product:  ProductInventoryDto
  onEdit:   (p: ProductInventoryDto) => void
  onAdjust: (v: ProductVariantInventoryDto) => void
}

function ProductRow({ product, onEdit, onAdjust }: ProductRowProps) {
  const [expanded, setExpanded] = useState(true)
  const deactivate = useDeactivateProduct()

  const totalQty = product.variants.reduce((s, v) => s + v.qtyAvailable, 0)
  const hasLowStock = product.variants.some(v => v.qtyAvailable <= 2)

  return (
    <>
      {/* Product header row */}
      <tr
        className="bg-gray-50/60 hover:bg-gray-100/60 cursor-pointer group"
        onClick={() => setExpanded(e => !e)}
      >
        <td className="px-4 py-2.5" colSpan={2}>
          <div className="flex items-center gap-2">
            {expanded
              ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            }
            <div>
              <span className="text-sm font-semibold text-gray-900">{product.name}</span>
              {product.brand && (
                <span className="ml-2 text-xs text-muted-foreground">{product.brand}</span>
              )}
            </div>
            {hasLowStock && (
              <span title="Low stock">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400 ml-1" />
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-2.5">
          <StockIndicator qty={totalQty} />
        </td>
        <td className="px-4 py-2.5 text-xs text-muted-foreground" colSpan={3}>
          {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
        </td>
        <td className="px-4 py-2.5" colSpan={2}>
          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-1 rounded hover:bg-white text-muted-foreground hover:text-gray-900"
              title="Edit product"
              onClick={e => { e.stopPropagation(); onEdit(product) }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1 rounded hover:bg-white text-muted-foreground hover:text-red-500"
              title="Deactivate"
              disabled={deactivate.isPending}
              onClick={e => { e.stopPropagation(); deactivate.mutate(product.id) }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Variant rows */}
      {expanded && product.variants.map(v => (
        <VariantRow
          key={v.id}
          variant={v}
          onEdit={() => onEdit(product)}
          onAdjust={onAdjust}
        />
      ))}
    </>
  )
}

interface CategorySectionProps {
  label:    string
  products: ProductInventoryDto[]
  onEdit:   (p: ProductInventoryDto) => void
  onAdjust: (v: ProductVariantInventoryDto) => void
}

function CategorySection({ label, products, onEdit, onAdjust }: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <tr
        className="bg-gray-900 cursor-pointer select-none"
        onClick={() => setCollapsed(c => !c)}
      >
        <td className="px-4 py-1.5" colSpan={8}>
          <div className="flex items-center gap-2">
            {collapsed
              ? <ChevronRight className="w-3 h-3 text-gray-400" />
              : <ChevronDown className="w-3 h-3 text-gray-400" />
            }
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              {label}
            </span>
            <span className="text-xs text-gray-500 ml-1">{products.length}</span>
          </div>
        </td>
      </tr>
      {!collapsed && products.map(p => (
        <ProductRow key={p.id} product={p} onEdit={onEdit} onAdjust={onAdjust} />
      ))}
    </>
  )
}

interface Props {
  products: ProductInventoryDto[]
  onEdit:   (p: ProductInventoryDto) => void
}

export function ProductInventoryTable({ products, onEdit }: Props) {
  const [adjustingVariant, setAdjustingVariant] = useState<ProductVariantInventoryDto | null>(null)

  // Group by category
  const grouped = products.reduce<Record<string, { label: string; items: ProductInventoryDto[] }>>(
    (acc, p) => {
      if (!acc[p.categoryCode]) {
        acc[p.categoryCode] = { label: p.categoryLabel, items: [] }
      }
      acc[p.categoryCode].items.push(p)
      return acc
    },
    {}
  )

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 border border-dashed border-gray-200 rounded-lg">
        <Package className="w-8 h-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No products found.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border border-gray-100 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-muted-foreground border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Product / Variant</th>
              <th className="text-left px-4 py-2 font-medium">UoM</th>
              <th className="text-left px-4 py-2 font-medium">Available</th>
              <th className="text-left px-4 py-2 font-medium">Reserved</th>
              <th className="text-left px-4 py-2 font-medium">Price</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-left px-4 py-2 font-medium">Lead</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Object.entries(grouped).map(([code, { label, items }]) => (
              <CategorySection
                key={code}
                label={label}
                products={items}
                onEdit={onEdit}
                onAdjust={setAdjustingVariant}
              />
            ))}
          </tbody>
        </table>
      </div>

      {adjustingVariant && (
        <StockAdjustModal
          variant={adjustingVariant}
          onClose={() => setAdjustingVariant(null)}
        />
      )}
    </>
  )
}
