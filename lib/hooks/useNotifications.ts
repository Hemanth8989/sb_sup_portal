'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/lib/api/notifications'

const keys = {
  all:         ()                                                  => ['notifications']            as const,
  list:        (p: object)                                         => ['notifications', 'list', p] as const,
  unreadCount: ()                                                  => ['notifications', 'unread']  as const,
}

export function useNotifications(params: {
  isRead?: boolean
  type?: string
  page?: number
  perPage?: number
} = {}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn:  () => notificationsApi.list(params),
    staleTime: 30_000,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: keys.unreadCount(),
    queryFn:  notificationsApi.unreadCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all() })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all() })
    },
  })
}
