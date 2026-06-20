'use client'

import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api/supplier/analytics'
import type { AnalyticsRange } from '@/lib/types/api'

const keys = {
  summary:     ()                        => ['analytics', 'summary']          as const,
  inventory:   (r: AnalyticsRange)       => ['analytics', 'inventory', r]     as const,
  revenue:     (r: AnalyticsRange)       => ['analytics', 'revenue', r]       as const,
  orders:      (r: AnalyticsRange)       => ['analytics', 'orders', r]        as const,
  connections: (r: AnalyticsRange)       => ['analytics', 'connections', r]   as const,
}

export function useInventoryAnalytics(range: AnalyticsRange = '30d') {
  return useQuery({
    queryKey: keys.inventory(range),
    queryFn:  () => analyticsApi.inventory(range),
    staleTime: 5 * 60_000,
  })
}

export function useRevenueAnalytics(range: AnalyticsRange = '30d') {
  return useQuery({
    queryKey: keys.revenue(range),
    queryFn:  () => analyticsApi.revenue(range),
    staleTime: 5 * 60_000,
  })
}

export function useOrderAnalytics(range: AnalyticsRange = '30d') {
  return useQuery({
    queryKey: keys.orders(range),
    queryFn:  () => analyticsApi.orders(range),
    staleTime: 5 * 60_000,
  })
}

export function useConnectionAnalytics(range: AnalyticsRange = '30d') {
  return useQuery({
    queryKey: keys.connections(range),
    queryFn:  () => analyticsApi.connections(range),
    staleTime: 5 * 60_000,
  })
}
