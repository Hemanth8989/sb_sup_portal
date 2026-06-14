'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSupplierProfile, updateSupplierProfile,
  getSupplierStats, getNotificationPrefs, updateNotificationPrefs,
} from '@/lib/api/supplier/profile'
import type { UpdateProfileRequest, NotificationPrefs } from '@/lib/types/profile'

const keys = {
  profile: () => ['supplier', 'profile'] as const,
  stats:   () => ['supplier', 'profile', 'stats'] as const,
  notifs:  () => ['supplier', 'notification-prefs'] as const,
}

export function useSupplierProfile() {
  return useQuery({ queryKey: keys.profile(), queryFn: getSupplierProfile, staleTime: 60_000 })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => updateSupplierProfile(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.profile() }),
  })
}

export function useSupplierStats() {
  return useQuery({ queryKey: keys.stats(), queryFn: getSupplierStats, staleTime: 300_000 })
}

export function useNotificationPrefs() {
  return useQuery({ queryKey: keys.notifs(), queryFn: getNotificationPrefs, staleTime: 60_000 })
}

export function useUpdateNotificationPrefs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: NotificationPrefs) => updateNotificationPrefs(body),
    onSuccess: data => qc.setQueryData(keys.notifs(), data),
  })
}
