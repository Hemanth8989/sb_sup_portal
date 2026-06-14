'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
}

export function AddWarehouseSheet({ open, onClose, editing }: Props) {
  const create = useCreateWarehouse()
  const update = useUpdateWarehouse(editing?.id ?? '')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '', addressLine1: '', city: '', stateProvince: '',
      postalCode: '', country: 'US', phone: '', setAsPrimary: false,
    },
  })

  useEffect(() => {
    if (editing) {
      reset({
        name:          editing.name,
        addressLine1:  editing.addressLine1 ?? '',
        city:          editing.city ?? '',
        stateProvince: editing.stateProvince ?? '',
        postalCode:    editing.postalCode ?? '',
        country:       editing.country,
        phone:         editing.phone ?? '',
        setAsPrimary:  editing.isPrimary,
      })
    } else {
      reset({ name: '', addressLine1: '', city: '', stateProvince: '', postalCode: '', country: 'US', phone: '', setAsPrimary: false })
    }
  }, [editing, reset])

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
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit Warehouse' : 'Add Warehouse'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-6 flex-1 overflow-y-auto px-1">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Name *</label>
            <Input {...register('name', { required: true })} placeholder="Main Warehouse" />
            {errors.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Address</label>
            <Input {...register('addressLine1')} placeholder="123 Stone Ave" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">City</label>
              <Input {...register('city')} placeholder="Atlanta" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">State / Province</label>
              <Input {...register('stateProvince')} placeholder="GA" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Postal Code</label>
              <Input {...register('postalCode')} placeholder="30301" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Country</label>
              <Input {...register('country')} placeholder="US" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Phone</label>
            <Input {...register('phone')} placeholder="+1 (404) 555-0100" />
          </div>
          {!editing && (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" {...register('setAsPrimary')} className="rounded" />
              Set as primary warehouse
            </label>
          )}

          <SheetFooter className="mt-auto pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : editing ? 'Save changes' : 'Add warehouse'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
