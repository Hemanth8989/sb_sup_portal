'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSupplierProfile, useUpdateProfile } from '@/lib/hooks/useSupplierProfile'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ShieldCheck, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { useToast } from './useToast'

const MAX_CHARS = 500

const schema = z.object({
  description: z.string().max(MAX_CHARS, `Max ${MAX_CHARS} characters`).optional(),
})

type FormValues = z.infer<typeof schema>

export function PublicProfileForm() {
  const { data: profile, isPending } = useSupplierProfile()
  const update = useUpdateProfile()
  const [charCount, setCharCount] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const { showToast, ToastEl } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: '' },
  })

  useEffect(() => {
    if (!profile) return
    const desc = profile.description ?? ''
    form.reset({ description: desc })
    setCharCount(desc.length)
  }, [profile, form])

  async function onSubmit(values: FormValues) {
    await update.mutateAsync({ displayName: profile!.displayName, description: values.description })
    form.reset(values)
    showToast()
  }

  if (isPending) {
    return (
      <Card className="shadow-sm">
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-24 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  const isDirty = form.formState.isDirty
  const description = form.watch('description') ?? ''

  return (
    <>
      <Card className="shadow-sm" id="public">
        <CardContent>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-foreground">Public profile</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Shown to fabricators browsing the supplier directory.</p>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              {isDirty && (
                <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-1">
                  Unsaved changes
                </span>
              )}
              <Badge
                variant="outline"
                className={profile?.verified
                  ? 'gap-1.5 bg-green-50 text-green-700 border-green-100'
                  : 'gap-1.5 text-muted-foreground'}
              >
                <ShieldCheck className="w-3 h-3" />
                {profile?.verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>

          {profile?.verified ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-50 border border-green-100 mb-4">
              <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-700">
                Your account is verified. A badge appears on your directory listing.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-100 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">
                Account not yet verified. Contact StoneBridge support to start the verification process.
              </p>
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">About your business</Label>
                <span className={`text-[11px] ${charCount > MAX_CHARS * 0.9 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
              <Textarea
                {...form.register('description')}
                placeholder="Tell fabricators about your business — materials you specialise in, regions you serve, what makes you stand out…"
                className="text-sm resize-none"
                rows={5}
                onChange={e => {
                  form.setValue('description', e.target.value, { shouldDirty: true })
                  setCharCount(e.target.value.length)
                }}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Directory preview */}
            <button
              type="button"
              onClick={() => setShowPreview(v => !v)}
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPreview ? 'Hide preview' : 'Preview as fabricator'}
            </button>

            {showPreview && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground overflow-hidden shrink-0">
                    {profile?.logoUrl
                      ? <img src={profile.logoUrl} alt="" className="w-full h-full object-cover" />
                      : <span className="font-medium">{profile?.displayName?.[0]?.toUpperCase() ?? '?'}</span>}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium leading-tight">{profile?.displayName ?? 'Your company name'}</p>
                    {profile?.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-700 mt-0.5">
                        <ShieldCheck className="w-3 h-3" /> Verified supplier
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {description || <span className="italic">No description yet.</span>}
                </p>
              </div>
            )}

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
