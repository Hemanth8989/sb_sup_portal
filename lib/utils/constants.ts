import type { SlabStatus } from '@/lib/types/api'

export const STATUS_CONFIG: Record<SlabStatus, { label: string; color: string; bg: string; dot: string }> = {
  available:  { label: 'Available',  color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   dot: 'bg-green-500' },
  reserved:   { label: 'Reserved',   color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200',  dot: 'bg-yellow-500' },
  hold:       { label: 'Hold',       color: 'text-red-700',    bg: 'bg-red-50 border-red-200',        dot: 'bg-red-500' },
  allocated:  { label: 'Allocated',  color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',      dot: 'bg-blue-500' },
  shipped:    { label: 'Shipped',    color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200',  dot: 'bg-purple-500' },
  sold:       { label: 'Sold',       color: 'text-slate-600',  bg: 'bg-slate-100 border-slate-200',   dot: 'bg-slate-400' },
}

export const MATERIAL_TYPES = [
  'granite', 'marble', 'quartzite', 'quartz', 'porcelain',
  'dekton', 'limestone', 'travertine', 'onyx', 'slate', 'soapstone', 'other',
] as const

export const COLOR_FAMILIES = [
  'white', 'cream', 'beige', 'gray', 'charcoal',
  'black', 'blue', 'green', 'red', 'brown', 'gold', 'multi',
] as const

export const FINISHES = [
  'polished', 'honed', 'leathered', 'brushed', 'sandblasted', 'flamed', 'natural',
] as const

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date Added' },
  { value: 'material_name', label: 'Material Name' },
  { value: 'net_sqft', label: 'Net Sqft' },
  { value: 'effective_price', label: 'Price' },
  { value: 'status', label: 'Status' },
  { value: 'status_changed', label: 'Status Changed' },
]
