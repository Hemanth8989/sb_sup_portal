'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateSlab, useUpdateSlab } from '@/lib/hooks/useSupplierSlabs'
import { useProductInventory } from '@/lib/hooks/useProductInventory'
import { useWarehouses } from '@/lib/hooks/useWarehouses'
import { useBundles } from '@/lib/hooks/useBundles'
import type { SupplierSlabDto } from '@/lib/types/api'
import type { CreateSlabBody } from '@/lib/api/supplier/slabs'

const MATERIAL_TYPES = ['granite','marble','quartzite','quartz','porcelain','dekton','limestone','travertine','onyx','slate','soapstone','other']
const COLOR_FAMILIES = ['white','cream','beige','gray','charcoal','black','blue','green','red','brown','gold','multi']
const FINISHES       = ['polished','honed','leathered','brushed','sandblasted','flamed','natural']
const GRADES         = ['A','B','C']
const THICKNESSES    = [1.2, 2, 3, 4]

interface Props {
  open: boolean
  onClose: () => void
  editing?: SupplierSlabDto | null
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 capitalize"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o} className="capitalize">{o.replace(/_/g, ' ')}</option>)}
    </select>
  )
}

export function AddSlabSheet({ open, onClose, editing }: Props) {
  const isEdit = !!editing
  const create = useCreateSlab()
  const update = useUpdateSlab()

  const { data: products }   = useProductInventory({ status: 'active', perPage: 200 })
  const { data: warehouses } = useWarehouses()
  const { data: bundles }    = useBundles()

  const allVariants = (products?.items ?? []).flatMap(p =>
    p.variants.map(v => ({ id: v.id, label: `${p.name} — ${v.variantName} (${v.sku})` }))
  )

  const [form, setForm] = useState<Partial<CreateSlabBody>>({
    qualityGrade: 'A',
    finish: 'polished',
    materialType: 'marble',
    thicknessCm: 2,
    isRemnant: false,
  })

  useEffect(() => {
    if (editing) {
      setForm({
        variantId:    editing.id, // variantId not on slab dto but required for create only
        internalRef:  editing.internalRef,
        materialType: editing.materialType,
        materialName: editing.materialName,
        finish:       editing.finish,
        thicknessCm:  editing.thicknessCm,
        grossLengthMm: editing.grossLengthMm,
        grossWidthMm:  editing.grossWidthMm,
        qualityGrade:  editing.qualityGrade,
        colorFamily:   editing.colorFamily ?? undefined,
        pattern:       editing.pattern ?? undefined,
        originCountry: editing.originCountry ?? undefined,
        quarryName:    editing.quarryName ?? undefined,
        lotNumber:     editing.lotNumber ?? undefined,
        blockNumber:   editing.blockNumber ?? undefined,
        barcode:       editing.barcode ?? undefined,
        weightKg:      editing.weightKg ?? undefined,
        bundleId:      editing.bundleId ?? undefined,
        warehouseId:   editing.warehouseId ?? undefined,
        rackLocation:  editing.rackLocation ?? undefined,
        priceOverride: editing.priceOverride ?? undefined,
        isRemnant:     editing.isRemnant,
        notes:         undefined,
      })
    } else {
      setForm({ qualityGrade: 'A', finish: 'polished', materialType: 'marble', thicknessCm: 2, isRemnant: false })
    }
  }, [editing, open])

  function set<K extends keyof CreateSlabBody>(key: K, value: CreateSlabBody[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  const isPending = create.isPending || update.isPending

  async function handleSubmit() {
    if (!form.internalRef || !form.materialType || !form.materialName || !form.finish ||
        !form.thicknessCm || !form.grossLengthMm || !form.grossWidthMm) { return }

    if (isEdit) {
      update.mutate(
        { id: editing!.id, body: form as any },
        { onSuccess: onClose },
      )
    } else {
      if (!form.variantId) { return }
      create.mutate(form as CreateSlabBody, { onSuccess: onClose })
    }
  }

  if (!open) { return null }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="w-[520px] bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">{isEdit ? 'Edit Slab' : 'Add Slab'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-gray-900 transition-colors text-lg leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Identification */}
          <div>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Identification</h3>
            <div className="grid grid-cols-2 gap-3">
              {!isEdit && (
                <div className="col-span-2">
                  <Field label="Product Variant *">
                    <select
                      value={form.variantId ?? ''}
                      onChange={e => set('variantId', e.target.value)}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="">Select variant…</option>
                      {allVariants.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                    </select>
                  </Field>
                </div>
              )}
              <Field label="Internal Ref *">
                <Input value={form.internalRef ?? ''} onChange={e => set('internalRef', e.target.value)} className="h-9 text-sm" placeholder="MM-001-A" />
              </Field>
              <Field label="Barcode">
                <Input value={form.barcode ?? ''} onChange={e => set('barcode', e.target.value || undefined)} className="h-9 text-sm" placeholder="Optional" />
              </Field>
              <Field label="Lot Number">
                <Input value={form.lotNumber ?? ''} onChange={e => set('lotNumber', e.target.value || undefined)} className="h-9 text-sm" />
              </Field>
              <Field label="Block Number">
                <Input value={form.blockNumber ?? ''} onChange={e => set('blockNumber', e.target.value || undefined)} className="h-9 text-sm" />
              </Field>
            </div>
          </div>

          {/* Material */}
          <div>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Material</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Material Type *">
                <Select value={form.materialType ?? ''} onChange={v => set('materialType', v)} options={MATERIAL_TYPES} />
              </Field>
              <Field label="Material Name *">
                <Input value={form.materialName ?? ''} onChange={e => set('materialName', e.target.value)} className="h-9 text-sm" placeholder="Calacatta Gold" />
              </Field>
              <Field label="Color Family">
                <Select value={form.colorFamily ?? ''} onChange={v => set('colorFamily', v || undefined)} options={COLOR_FAMILIES} placeholder="Select…" />
              </Field>
              <Field label="Pattern">
                <Select value={form.pattern ?? ''} onChange={v => set('pattern', v || undefined)}
                  options={['solid','veined','bookmatched','flecked','exotic']} placeholder="Select…" />
              </Field>
              <Field label="Origin Country">
                <Input value={form.originCountry ?? ''} onChange={e => set('originCountry', e.target.value || undefined)} className="h-9 text-sm" placeholder="IT" maxLength={2} />
              </Field>
              <Field label="Quarry Name">
                <Input value={form.quarryName ?? ''} onChange={e => set('quarryName', e.target.value || undefined)} className="h-9 text-sm" />
              </Field>
            </div>
          </div>

          {/* Physical */}
          <div>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Physical Attributes</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Finish *">
                <Select value={form.finish ?? ''} onChange={v => set('finish', v)} options={FINISHES} />
              </Field>
              <Field label="Quality Grade *">
                <Select value={form.qualityGrade ?? 'A'} onChange={v => set('qualityGrade', v)} options={GRADES} />
              </Field>
              <Field label="Thickness (cm) *">
                <select
                  value={form.thicknessCm ?? ''}
                  onChange={e => set('thicknessCm', parseFloat(e.target.value))}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {THICKNESSES.map(t => <option key={t} value={t}>{t} cm</option>)}
                </select>
              </Field>
              <Field label="Weight (kg)">
                <Input type="number" step="0.1" value={form.weightKg ?? ''} onChange={e => set('weightKg', parseFloat(e.target.value) || undefined)} className="h-9 text-sm" />
              </Field>
              <Field label="Gross Length (mm) *">
                <Input type="number" value={form.grossLengthMm ?? ''} onChange={e => set('grossLengthMm', parseInt(e.target.value))} className="h-9 text-sm" />
              </Field>
              <Field label="Gross Width (mm) *">
                <Input type="number" value={form.grossWidthMm ?? ''} onChange={e => set('grossWidthMm', parseInt(e.target.value))} className="h-9 text-sm" />
              </Field>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-remnant"
                  checked={form.isRemnant ?? false}
                  onChange={e => set('isRemnant', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="is-remnant" className="text-sm text-gray-700">Mark as remnant</label>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Location</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Warehouse">
                <select
                  value={form.warehouseId ?? ''}
                  onChange={e => set('warehouseId', e.target.value || undefined)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">No warehouse</option>
                  {(warehouses ?? []).filter(w => w.isActive).map(w => (
                    <option key={w.id} value={w.id}>{w.name}{w.city ? ` — ${w.city}` : ''}</option>
                  ))}
                </select>
              </Field>
              <Field label="Rack / Section">
                <Input value={form.rackLocation ?? ''} onChange={e => set('rackLocation', e.target.value || undefined)} className="h-9 text-sm" placeholder="A-12" />
              </Field>
              <Field label="Bundle">
                <select
                  value={form.bundleId ?? ''}
                  onChange={e => set('bundleId', e.target.value || undefined)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">No bundle</option>
                  {(bundles ?? []).map(b => (
                    <option key={b.id} value={b.id}>{b.bundleRef} — {b.materialName}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Pricing</h3>
            <Field label="Price Override ($/sqft) — leave blank to use variant base price">
              <Input
                type="number"
                step="0.01"
                value={form.priceOverride ?? ''}
                onChange={e => set('priceOverride', parseFloat(e.target.value) || undefined)}
                className="h-9 text-sm"
                placeholder="e.g. 45.00"
              />
            </Field>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Notes</h3>
            <textarea
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value || undefined)}
              rows={3}
              placeholder="Internal notes (not visible to fabricators)…"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={isPending} onClick={handleSubmit}>
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Slab'}
          </Button>
        </div>
      </div>
    </div>
  )
}
