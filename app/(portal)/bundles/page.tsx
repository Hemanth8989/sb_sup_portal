'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { BundleTable } from './_components/BundleTable'
import { AddBundleSheet } from './_components/AddBundleSheet'
import { useBundles } from '@/lib/hooks/useBundles'
import type { BundleDto } from '@/lib/types/api'
import { useDebounce } from '@/lib/hooks/useDebounce'

export default function BundlesPage() {
  const [search, setSearch]   = useState('')
  const debouncedSearch       = useDebounce(search, 300)
  const { data, isPending, isError } = useBundles(debouncedSearch || undefined)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing]     = useState<BundleDto | null>(null)

  const openAdd  = () => { setEditing(null); setSheetOpen(true) }
  const openEdit = (b: BundleDto) => { setEditing(b); setSheetOpen(true) }
  const close    = () => { setSheetOpen(false); setEditing(null) }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <h1 className="text-sm font-semibold text-gray-900">Bundles</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bundles…"
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex-1" />
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Add Bundle
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isPending && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-sm text-muted-foreground">Failed to load bundles.</p>
          </div>
        )}

        {data && <BundleTable bundles={data} onEdit={openEdit} />}
      </div>

      <AddBundleSheet open={sheetOpen} onClose={close} editing={editing} />
    </div>
  )
}
