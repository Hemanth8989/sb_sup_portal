import { api } from '@/lib/api/client'
import type {
  AnalyticsRange,
  InventoryAnalytics,
  RevenueAnalytics,
  OrderAnalytics,
  ConnectionAnalytics,
  InventorySummary,
} from '@/lib/types/api'

const BASE = '/api/v1/supplier/analytics'

export const analyticsApi = {
  summary: (): Promise<InventorySummary> =>
    api.get(`${BASE}/summary`),

  inventory: (range: AnalyticsRange = '30d'): Promise<InventoryAnalytics> =>
    api.get(`${BASE}/inventory`, { params: { range } }),

  revenue: (range: AnalyticsRange = '30d'): Promise<RevenueAnalytics> =>
    api.get(`${BASE}/revenue`, { params: { range } }),

  orders: (range: AnalyticsRange = '30d'): Promise<OrderAnalytics> =>
    api.get(`${BASE}/orders`, { params: { range } }),

  connections: (range: AnalyticsRange = '30d'): Promise<ConnectionAnalytics> =>
    api.get(`${BASE}/connections`, { params: { range } }),
}
