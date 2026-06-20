import { api } from '@/lib/api/client'
import type { NotificationDto, PagedResult } from '@/lib/types/api'

const BASE = '/api/v1/notifications'

export const notificationsApi = {
  list: (params: { isRead?: boolean; type?: string; page?: number; perPage?: number } = {}): Promise<PagedResult<NotificationDto>> =>
    api.get(BASE, { params: params as Record<string, unknown> }),

  unreadCount: (): Promise<{ count: number }> =>
    api.get(`${BASE}/unread-count`),

  markRead: (id: string): Promise<void> =>
    api.patch(`${BASE}/${id}/read`, {}),

  markAllRead: (): Promise<void> =>
    api.post(`${BASE}/read-all`, {}),
}
