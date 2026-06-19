'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useConnection, useRespondConnection, useUpdateConnectionTier } from '@/lib/hooks/useConnections'

const STATUS_COLOR: Record<string, string> = {
  active:     'bg-green-50 text-green-700',
  pending:    'bg-yellow-50 text-yellow-700',
  suspended:  'bg-orange-50 text-orange-700',
  declined:   'bg-red-50 text-red-500',
  terminated: 'bg-gray-100 text-gray-500',
}

const TIERS = ['standard', 'preferred', 'vip'] as const

export default function ConnectionDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const router   = useRouter()
  const { data: conn, isPending, isError } = useConnection(id)
  const respond  = useRespondConnection()
  const updateTier = useUpdateConnectionTier()

  if (isPending) return (
    <div className="p-6 flex flex-col gap-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-40" />
    </div>
  )

  if (isError || !conn) return (
    <div className="p-6 flex items-center justify-center h-48">
      <p className="text-sm text-muted-foreground">Connection not found.</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900">{conn.fabricatorName}</h1>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_COLOR[conn.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {conn.status}
        </span>
        <div className="flex-1" />
        {conn.status === 'pending' && (
          <>
            <Button size="sm" variant="outline" className="text-green-700 border-green-200"
              disabled={respond.isPending}
              onClick={() => respond.mutate({ id, action: 'approve' })}
            >Approve</Button>
            <Button size="sm" variant="ghost" className="text-red-500"
              disabled={respond.isPending}
              onClick={() => respond.mutate({ id, action: 'decline' })}
            >Decline</Button>
          </>
        )}
        {conn.status === 'active' && (
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-200"
            disabled={respond.isPending}
            onClick={() => respond.mutate({ id, action: 'suspend' })}
          >Suspend</Button>
        )}
        {conn.status === 'suspended' && (
          <Button size="sm" variant="outline" className="text-green-700 border-green-200"
            disabled={respond.isPending}
            onClick={() => respond.mutate({ id, action: 'reactivate' })}
          >Reactivate</Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 auto-rows-min">
        {/* Profile */}
        <div className="border border-gray-100 rounded-lg bg-white p-5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Fabricator Profile</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Company</dt>
              <dd className="font-medium">{conn.fabricatorName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Location</dt>
              <dd>{[conn.fabricatorCity, conn.fabricatorState].filter(Boolean).join(', ') || '—'}</dd>
            </div>
            {conn.fabricatorPhone && (
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd>{conn.fabricatorPhone}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">Connected Since</dt>
              <dd>{conn.connectedAt ? new Date(conn.connectedAt).toLocaleDateString() : '—'}</dd>
            </div>
          </dl>
        </div>

        {/* Pricing */}
        <div className="border border-gray-100 rounded-lg bg-white p-5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pricing Configuration</h2>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Pricing Tier</p>
              <div className="flex gap-1.5">
                {TIERS.map(t => (
                  <button
                    key={t}
                    onClick={() => updateTier.mutate({ id, tier: t })}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                      conn.pricingTier === t
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assigned Price List</p>
              <p className="text-sm mt-0.5">{conn.assignedPriceListName ?? 'None assigned'}</p>
            </div>
          </div>
        </div>

        {conn.requestMessage && (
          <div className="col-span-2 border border-gray-100 rounded-lg bg-white p-5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Request Message</h2>
            <p className="text-sm text-gray-700">{conn.requestMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}
