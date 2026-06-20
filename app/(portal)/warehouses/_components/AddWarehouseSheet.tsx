'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateWarehouse, useUpdateWarehouse } from '@/lib/hooks/useWarehouses'
import type { WarehouseDto } from '@/lib/types/api'
import type { CreateWarehouseBody } from '@/lib/api/supplier/warehouses'

interface Props {
  open: boolean
  onClose: () => void
  editing?: WarehouseDto | null
}

type FormValues = {
  name: string
  addressLine1: string
  city: string
  stateProvince: string
  postalCode: string
  country: string
  phone: string
  setAsPrimary: boolean
  capacitySqft: string
  notes: string
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-gray-600 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

export function AddWarehouseSheet({ open, onClose, editing }: Props) {
  const create = useCreateWarehouse()
  const update = useUpdateWarehouse(editing?.id ?? '')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '', addressLine1: '', city: '', stateProvince: '',
      postalCode: '', country: 'US', phone: '', setAsPrimary: false,
      capacitySqft: '', notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset(editing
        ? {
            name:          editing.name,
            addressLine1:  editing.addressLine1 ?? '',
            city:          editing.city ?? '',
            stateProvince: editing.stateProvince ?? '',
            postalCode:    editing.postalCode ?? '',
            country:       editing.country,
            phone:         editing.phone ?? '',
            setAsPrimary:  editing.isPrimary,
            capacitySqft:  editing.capacitySqft?.toString() ?? '',
            notes:         editing.notes ?? '',
          }
        : {
            name: '', addressLine1: '', city: '', stateProvince: '',
            postalCode: '', country: 'US', phone: '', setAsPrimary: false,
            capacitySqft: '', notes: '',
          }
      )
    }
  }, [open, editing, reset])

  const onSubmit = async (values: FormValues) => {
    const body: CreateWarehouseBody = {
      name:          values.name,
      addressLine1:  values.addressLine1 || undefined,
      city:          values.city || undefined,
      stateProvince: values.stateProvince || undefined,
      postalCode:    values.postalCode || undefined,
      country:       values.country || undefined,
      phone:         values.phone || undefined,
      setAsPrimary:  values.setAsPrimary,
      capacitySqft:  values.capacitySqft ? parseFloat(values.capacitySqft) : null,
      notes:         values.notes || null,
    }
    if (editing) {
      await update.mutateAsync(body)
    } else {
      await create.mutateAsync(body)
    }
    onClose()
  }

  const isPending = create.isPending || update.isPending

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-[440px] sm:w-[480px] flex flex-col p-0 gap-0">

        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-gray-200">
          <SheetTitle className="text-base font-semibold text-gray-900">
            {editing ? 'Edit Warehouse' : 'New Warehouse'}
          </SheetTitle>
          <p className="text-xs text-gray-500 mt-0.5 font-normal">
            {editing ? 'Update warehouse information.' : 'Add a new storage location for your inventory.'}
          </p>
        </SheetHeader>

        {/* Form body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Basic info */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Basic Information
              </h3>
              <div>
                <FieldLabel required>Warehouse Name</FieldLabel>
                <Input
                  {...register('name', { required: true })}
                  placeholder="e.g. Main Warehouse, North Hub"
                  className={errors.name ? 'border-red-300 focus-visible:ring-red-300' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">Name is required.</p>
                )}
              </div>
              <div>
                <FieldLabel>Phone</FieldLabel>
                <Input
                  {...register('phone')}
                  placeholder="+1 (404) 555-0100"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Address
              </h3>
              <div>
                <FieldLabel>Street Address</FieldLabel>
                <Input {...register('addressLine1')} placeholder="123 Stone Ave" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>City</FieldLabel>
                  <Input {...register('city')} placeholder="Atlanta" />
                </div>
                <div>
                  <FieldLabel>State / Province</FieldLabel>
                  <Input {...register('stateProvince')} placeholder="GA" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Postal Code</FieldLabel>
                  <Input {...register('postalCode')} placeholder="30301" />
                </div>
                <div>
                  <FieldLabel>Country</FieldLabel>
                  <Input {...register('country')} placeholder="US" />
                </div>
              </div>
            </div>

            {/* Capacity & Notes */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Capacity &amp; Notes
              </h3>
              <div>
                <FieldLabel>Storage Capacity (sq ft)</FieldLabel>
                <Input
                  {...register('capacitySqft')}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 5000"
                />
                <p className="text-[11px] text-gray-400 mt-1">Used to calculate utilization percentage.</p>
              </div>
              <div>
                <FieldLabel>Internal Notes</FieldLabel>
                <Textarea
                  {...register('notes')}
                  placeholder="Operational notes, access instructions, etc."
                  className="resize-none text-sm"
                  rows={3}
                />
              </div>
            </div>

            {/* Options */}
            {!editing && (
              <div className="space-y-3">
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Options
                </h3>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      {...register('setAsPrimary')}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 accent-gray-900"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Set as primary warehouse</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      The primary warehouse is used as the default for new inventory and reports.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2 shrink-0 bg-gray-50">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Warehouse'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
