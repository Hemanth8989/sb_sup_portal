'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpsertProduct } from '@/lib/hooks/useProductInventory'
import type { ProductInventoryDto } from '@/lib/types/api'

const CATEGORIES = [
  { code: 'sink',                 label: 'Sink / Undermount' },
  { code: 'blade',                label: 'Cutting Blade' },
  { code: 'bit',                  label: 'Router Bit' },
  { code: 'wheel',                label: 'Grinding Wheel' },
  { code: 'pad',                  label: 'Polishing Pad' },
  { code: 'faucet_hole_template', label: 'Faucet Hole Template' },
  { code: 'bracket',              label: 'Bracket / Support' },
  { code: 'clip',                 label: 'Clip / Fastener' },
  { code: 'adhesive',             label: 'Adhesive / Epoxy' },
  { code: 'sealer',               label: 'Sealer / Impregnator' },
  { code: 'cleaner',              label: 'Cleaner / Maintenance' },
  { code: 'colorant',             label: 'Color Fill / Colorant' },
  { code: 'abrasive',             label: 'Abrasive / Sandpaper' },
  { code: 'edge_profile_template',label: 'Edge Profile Template' },
  { code: 'backsplash_tile',      label: 'Backsplash Tile' },
  { code: 'trim',                 label: 'Trim / Molding' },
  { code: 'ppe',                  label: 'PPE / Safety' },
  { code: 'dust_collection',      label: 'Dust Collection' },
  { code: 'packaging',            label: 'Packaging / Crating' },
  { code: 'tool',                 label: 'Hand Tool' },
  { code: 'equipment',            label: 'Power Equipment' },
  { code: 'other',                label: 'Other' },
]

const UOMS = [
  { code: 'each',       label: 'Each' },
  { code: 'sqft',       label: 'Square Foot' },
  { code: 'sqm',        label: 'Square Meter' },
  { code: 'linear_ft',  label: 'Linear Foot' },
  { code: 'linear_m',   label: 'Linear Meter' },
  { code: 'liter',      label: 'Liter' },
  { code: 'gallon',     label: 'Gallon' },
  { code: 'kg',         label: 'Kilogram' },
  { code: 'lb',         label: 'Pound' },
  { code: 'box',        label: 'Box' },
  { code: 'case',       label: 'Case' },
  { code: 'roll',       label: 'Roll' },
  { code: 'bag',        label: 'Bag' },
  { code: 'pair',       label: 'Pair' },
  { code: 'set',        label: 'Set' },
]

interface FormValues {
  categoryCode:  string
  name:          string
  brand:         string
  description:   string
  sku:           string
  variantName:   string
  unitOfMeasure: string
  basePrice:     number
  qtyAvailable:  number
  leadTimeDays:  number | ''
}

interface Props {
  open:    boolean
  onClose: () => void
  editing: ProductInventoryDto | null
}

export function AddProductSheet({ open, onClose, editing }: Props) {
  const upsert = useUpsertProduct()
  const firstVariant = editing?.variants[0]

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      categoryCode:  'sink',
      name:          '',
      brand:         '',
      description:   '',
      sku:           '',
      variantName:   '',
      unitOfMeasure: 'each',
      basePrice:     0,
      qtyAvailable:  0,
      leadTimeDays:  '',
    },
  })

  useEffect(() => {
    if (editing && firstVariant) {
      reset({
        categoryCode:  editing.categoryCode,
        name:          editing.name,
        brand:         editing.brand ?? '',
        description:   editing.description ?? '',
        sku:           firstVariant.sku,
        variantName:   firstVariant.variantName,
        unitOfMeasure: firstVariant.unitOfMeasure,
        basePrice:     firstVariant.basePrice,
        qtyAvailable:  firstVariant.qtyAvailable,
        leadTimeDays:  firstVariant.leadTimeDays ?? '',
      })
    } else if (!editing) {
      reset({
        categoryCode: 'sink', name: '', brand: '', description: '',
        sku: '', variantName: '', unitOfMeasure: 'each',
        basePrice: 0, qtyAvailable: 0, leadTimeDays: '',
      })
    }
  }, [editing, firstVariant, reset])

  const onSubmit = (values: FormValues) => {
    upsert.mutate(
      {
        productId:     editing?.id,
        variantId:     firstVariant?.id,
        categoryCode:  values.categoryCode,
        name:          values.name,
        brand:         values.brand || undefined,
        description:   values.description || undefined,
        sku:           values.sku,
        variantName:   values.variantName,
        unitOfMeasure: values.unitOfMeasure,
        basePrice:     Number(values.basePrice),
        qtyAvailable:  Number(values.qtyAvailable),
        leadTimeDays:  values.leadTimeDays !== '' ? Number(values.leadTimeDays) : undefined,
      },
      { onSuccess: () => { reset(); onClose() } }
    )
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit Product' : 'Add Product'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          {/* Category */}
          <div>
            <Label htmlFor="categoryCode">Category *</Label>
            <select
              id="categoryCode"
              {...register('categoryCode', { required: true })}
              className="mt-1 w-full border rounded px-2 py-1.5 text-sm bg-white"
            >
              {CATEGORIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Product name */}
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" {...register('name', { required: true })} placeholder="e.g. Stainless Undermount Sink" className="mt-1" />
            {errors.name && <p className="text-xs text-red-500 mt-1">Required</p>}
          </div>

          {/* Brand */}
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" {...register('brand')} placeholder="e.g. Blanco" className="mt-1" />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} placeholder="Short description" className="mt-1" />
          </div>

          <hr className="border-gray-100" />

          {/* SKU */}
          <div>
            <Label htmlFor="sku">SKU *</Label>
            <Input id="sku" {...register('sku', { required: true })} placeholder="e.g. BL-440-SS-33" className="mt-1 font-mono" />
            {errors.sku && <p className="text-xs text-red-500 mt-1">Required</p>}
          </div>

          {/* Variant name */}
          <div>
            <Label htmlFor="variantName">Variant Name *</Label>
            <Input id="variantName" {...register('variantName', { required: true })} placeholder='e.g. Blanco 440 33" Satin' className="mt-1" />
            {errors.variantName && <p className="text-xs text-red-500 mt-1">Required</p>}
          </div>

          {/* UoM */}
          <div>
            <Label htmlFor="unitOfMeasure">Unit of Measure *</Label>
            <select
              id="unitOfMeasure"
              {...register('unitOfMeasure', { required: true })}
              className="mt-1 w-full border rounded px-2 py-1.5 text-sm bg-white"
            >
              {UOMS.map(u => (
                <option key={u.code} value={u.code}>{u.label}</option>
              ))}
            </select>
          </div>

          {/* Price + Qty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="basePrice">Price (USD) *</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                min="0"
                {...register('basePrice', { required: true, min: 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="qtyAvailable">Stock Qty *</Label>
              <Input
                id="qtyAvailable"
                type="number"
                min="0"
                {...register('qtyAvailable', { required: true, min: 0 })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Lead time */}
          <div>
            <Label htmlFor="leadTimeDays">Lead Time (days)</Label>
            <Input
              id="leadTimeDays"
              type="number"
              min="0"
              {...register('leadTimeDays')}
              placeholder="e.g. 5"
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" disabled={upsert.isPending}>
              {upsert.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
