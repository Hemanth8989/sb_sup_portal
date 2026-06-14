'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateBundle, useUpdateBundle } from '@/lib/hooks/useBundles'
import type { BundleDto } from '@/lib/types/api'

interface Props {
  open: boolean
  onClose: () => void
  editing?: BundleDto | null
}

type FormValues = {
  bundleRef: string
  materialName: string
  quarryName: string
  originCountry: string
  arrivalDate: string
  invoiceRef: string
  notes: string
}

export function AddBundleSheet({ open, onClose, editing }: Props) {
  const create = useCreateBundle()
  const update = useUpdateBundle(editing?.id ?? '')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      bundleRef: '', materialName: '', quarryName: '',
      originCountry: '', arrivalDate: '', invoiceRef: '', notes: '',
    },
  })

  useEffect(() => {
    if (editing) {
      reset({
        bundleRef:     editing.bundleRef,
        materialName:  editing.materialName,
        quarryName:    editing.quarryName ?? '',
        originCountry: editing.originCountry ?? '',
        arrivalDate:   editing.arrivalDate ?? '',
        invoiceRef:    editing.invoiceRef ?? '',
        notes:         editing.notes ?? '',
      })
    } else {
      reset({ bundleRef: '', materialName: '', quarryName: '', originCountry: '', arrivalDate: '', invoiceRef: '', notes: '' })
    }
  }, [editing, reset])

  const onSubmit = async (values: FormValues) => {
    const body = {
      bundleRef:     values.bundleRef,
      materialName:  values.materialName,
      quarryName:    values.quarryName    || undefined,
      originCountry: values.originCountry || undefined,
      arrivalDate:   values.arrivalDate   || undefined,
      invoiceRef:    values.invoiceRef    || undefined,
      notes:         values.notes         || undefined,
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
          <SheetTitle>{editing ? 'Edit Bundle' : 'Add Bundle'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-6 flex-1 overflow-y-auto px-1">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Bundle Ref *</label>
            <Input {...register('bundleRef', { required: true })} placeholder="BDL-2026-001" />
            {errors.bundleRef && <p className="text-xs text-red-500 mt-1">Bundle reference is required</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Material Name *</label>
            <Input {...register('materialName', { required: true })} placeholder="Calacatta White Marble" />
            {errors.materialName && <p className="text-xs text-red-500 mt-1">Material name is required</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Quarry Name</label>
            <Input {...register('quarryName')} placeholder="Carrara Quarry" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Origin Country</label>
              <Input {...register('originCountry')} placeholder="IT" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Arrival Date</label>
              <Input type="date" {...register('arrivalDate')} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Invoice Ref</label>
            <Input {...register('invoiceRef')} placeholder="INV-2026-0042" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Optional notes about this bundle…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <SheetFooter className="mt-auto pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : editing ? 'Save changes' : 'Add bundle'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
