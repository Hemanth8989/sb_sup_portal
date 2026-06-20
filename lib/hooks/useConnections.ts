import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { connectionsApi } from '../api/supplier/connections'

const keys = {
  all:    ['connections']                             as const,
  list:   (p: object) => ['connections', p]           as const,
  detail: (id: string) => ['connections', id]          as const,
}

export function useConnections(params: { status?: string } = {}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn:  () => connectionsApi.list(params),
  })
}

export function useConnection(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn:  () => connectionsApi.get(id),
    enabled:  !!id,
  })
}

export function useRespondConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: string; reason?: string }) =>
      connectionsApi.respond(id, { action, reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useUpdateConnectionTier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, tier }: { id: string; tier: string }) =>
      connectionsApi.updateTier(id, tier),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) })
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useAssignPriceList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, priceListId }: { id: string; priceListId: string | null }) =>
      connectionsApi.assignPriceList(id, priceListId),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) })
      qc.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useUpdateConnectionNotes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string | null }) =>
      connectionsApi.updateNotes(id, notes),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) })
    },
  })
}
