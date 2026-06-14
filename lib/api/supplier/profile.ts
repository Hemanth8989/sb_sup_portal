import { api } from '@/lib/api/client'
import type { SupplierProfile, SupplierStats, NotificationPrefs, UpdateProfileRequest } from '@/lib/types/profile'

export async function getSupplierProfile(): Promise<SupplierProfile> {
  return api.get('/api/v1/supplier/profile')
}

export async function updateSupplierProfile(body: UpdateProfileRequest): Promise<SupplierProfile> {
  return api.put('/api/v1/supplier/profile', body)
}

export async function getSupplierStats(): Promise<SupplierStats> {
  return api.get('/api/v1/supplier/profile/stats')
}

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  return api.get('/api/v1/supplier/notification-preferences')
}

export async function updateNotificationPrefs(body: NotificationPrefs): Promise<NotificationPrefs> {
  return api.put('/api/v1/supplier/notification-preferences', body)
}
