'use client'

import { useForm } from 'react-hook-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreatePriceList } from '@/lib/hooks/usePriceLists'

interface Props {
  open: boolean
  onClose: () => void
}

interface FormValues {
  name:        string
  tier:        string
  currency:    string
  description: string
}

export function AddPriceListSheet({ open, onClose }: Props) {
  const create = useCreatePriceList()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', tier: 'standard', currency: 'USD', description: '' },
  })

  const onSubmit = (values: FormValues) => {
    create.mutate(
      { name: values.name, tier: values.tier, currency: values.currency, description: values.description || undefined },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Price List</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name', { required: true })}
              placeholder="e.g. Standard 2026"
              className="mt-1"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
          </div>

          <div>
            <Label htmlFor="tier">Tier</Label>
            <select
              id="tier"
              {...register('tier')}
              className="mt-1 w-full border rounded px-2 py-1.5 text-sm bg-white"
            >
              <option value="standard">Standard</option>
              <option value="preferred">Preferred</option>
              <option value="vip">VIP</option>

            </select>
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              {...register('currency', { required: true })}
              placeholder="USD"
              maxLength={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Optional description"
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
