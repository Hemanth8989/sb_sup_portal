'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, ArrowRight, Pencil, Package2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { BundleDto } from '@/lib/types/api'
import { formatSqft } from '@/lib/utils/formatters'

interface Props {
  bundles: BundleDto[]
  onEdit: (bundle: BundleDto) => void
}

function BundleRow({ bundle: b, onEdit }: { bundle: BundleDto; onEdit: (b: BundleDto) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TableRow className="hover:bg-gray-50 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <TableCell className="w-8">
          {open
            ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        </TableCell>
        <TableCell className="font-mono text-xs font-medium text-gray-800">{b.bundleRef}</TableCell>
        <TableCell className="text-sm text-gray-900">{b.materialName}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{b.quarryName ?? '—'}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{b.originCountry ?? '—'}</TableCell>
        <TableCell className="text-center">
          <span className="text-sm font-semibold text-gray-900">{b.slabCount}</span>
        </TableCell>
        <TableCell className="text-center">
          <Badge variant="secondary" className="text-[11px]">{b.availableCount}</Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {b.totalSqftAvailable != null ? formatSqft(b.totalSqftAvailable) : '—'}
        </TableCell>
        <TableCell onClick={e => e.stopPropagation()} className="w-20">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(b)}>
              <Pencil className="w-3 h-3" />
            </Button>
            <Link href={`/bundles/${b.id}`} onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </TableCell>
      </TableRow>

      {open && (
        <TableRow>
          <TableCell colSpan={9} className="p-0">
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-3">
              <div className="text-xs text-muted-foreground mb-2">
                Bundle details — {b.invoiceRef ? `Invoice: ${b.invoiceRef}` : 'No invoice ref'}
                {b.arrivalDate ? ` · Arrived: ${b.arrivalDate}` : ''}
              </div>
              {b.notes && (
                <p className="text-xs text-gray-600 italic mb-2">{b.notes}</p>
              )}
              <Link href={`/bundles/${b.id}`}>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  View all slabs in this bundle <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export function BundleTable({ bundles, onEdit }: Props) {
  if (bundles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <Package2 className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No bundles match your search.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Bundle Ref</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Material</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Quarry</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Origin</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center">Slabs</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center">Available</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Sqft Avail.</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {bundles.map(b => (
            <BundleRow key={b.id} bundle={b} onEdit={onEdit} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
