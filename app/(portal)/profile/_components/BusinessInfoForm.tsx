'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSupplierProfile, useUpdateProfile } from '@/lib/hooks/useSupplierProfile'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Upload } from 'lucide-react'
import { useToast } from './useToast'

const schema = z.object({
  displayName:     z.string().min(1, 'Display name is required'),
  phone:           z.string().optional(),
  website:         z.string().optional(),
  establishedYear: z.string().optional(),
  addressLine1:    z.string().optional(),
  addressLine2:    z.string().optional(),
  city:            z.string().optional(),
  stateProvince:   z.string().optional(),
  postalCode:      z.string().optional(),
  country:         z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function BusinessInfoForm() {
  const { data: profile, isPending } = useSupplierProfile()
  const update = useUpdateProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const { showToast, ToastEl } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: '', phone: '', website: '',
      addressLine1: '', addressLine2: '', city: '',
      stateProvince: '', postalCode: '', country: 'US',
    },
  })

  useEffect(() => {
    if (!profile) return
    form.reset({
      displayName:     profile.displayName ?? '',
      phone:           profile.phone ?? '',
      website:         profile.website ?? '',
      establishedYear: profile.establishedYear != null ? String(profile.establishedYear) : '',
      addressLine1:    profile.addressLine1 ?? '',
      addressLine2:    profile.addressLine2 ?? '',
      city:            profile.city ?? '',
      stateProvince:   profile.stateProvince ?? '',
      postalCode:      profile.postalCode ?? '',
      country:         profile.country ?? 'US',
    })
  }, [profile, form])

  async function onSubmit(values: FormValues) {
    const year = values.establishedYear ? parseInt(values.establishedYear, 10) : undefined
    await update.mutateAsync({
      displayName:     values.displayName,
      phone:           values.phone || undefined,
      website:         values.website || undefined,
      establishedYear: year && !isNaN(year) ? year : undefined,
      addressLine1:    values.addressLine1 || undefined,
      addressLine2:    values.addressLine2 || undefined,
      city:            values.city || undefined,
      stateProvince:   values.stateProvince || undefined,
      postalCode:      values.postalCode || undefined,
      country:         values.country || 'US',
    })
    form.reset(values)
    showToast()
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
  }

  if (isPending) {
    return (
      <Card className="shadow-sm">
        <CardContent className="space-y-4">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-4 w-72 rounded" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}
          </div>
        </CardContent>
      </Card>
    )
  }

  const isDirty = form.formState.isDirty

  return (
    <>
      <Card className="shadow-sm" id="business">
        <CardContent>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-medium text-foreground">Business information</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Your legal and contact details. Not shown publicly to fabricators.</p>
            </div>
            {isDirty && (
              <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-1 shrink-0 ml-4">
                Unsaved changes
              </span>
            )}
          </div>

          {/* Logo upload */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {(logoPreview || profile?.logoUrl)
                ? <img src={logoPreview ?? profile!.logoUrl!} alt="Logo" className="w-full h-full object-cover" />
                : <Upload className="w-5 h-5 text-muted-foreground" />}
            </div>
            <div className="space-y-1.5">
              <Button variant="outline" size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
                <Upload /> Upload logo
              </Button>
              <p className="text-[11px] text-muted-foreground">PNG or JPG, max 2 MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Display name <span className="text-destructive">*</span></Label>
                <Input {...form.register('displayName')} className="h-8 text-sm" />
                {form.formState.errors.displayName && (
                  <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Established year</Label>
                <Input {...form.register('establishedYear')} placeholder="e.g. 2009" className="h-8 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input {...form.register('phone')} placeholder="+1 (512) 555-0000" className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Website</Label>
                <Input {...form.register('website')} placeholder="yoursite.com" className="h-8 text-sm" />
              </div>
            </div>

            <Separator className="my-1" />

            <p className="text-xs font-medium text-muted-foreground">Address</p>

            <div className="space-y-1.5">
              <Label className="text-xs">Street address</Label>
              <Input {...form.register('addressLine1')} className="h-8 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Apt, suite, etc.</Label>
              <Input {...form.register('addressLine2')} className="h-8 text-sm" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">City</Label>
                <Input {...form.register('city')} className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">State / Province</Label>
                <Input {...form.register('stateProvince')} placeholder="TX" className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">ZIP / Postal code</Label>
                <Input {...form.register('postalCode')} className="h-8 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Input {...form.register('country')} placeholder="US" className="h-8 text-sm" />
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" size="sm" disabled={!isDirty || update.isPending}>
                {update.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {ToastEl}
    </>
  )
}
