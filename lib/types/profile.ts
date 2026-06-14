export interface SupplierProfile {
  tenantId: string
  displayName: string
  logoUrl: string | null
  description: string | null
  website: string | null
  phone: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  stateProvince: string | null
  postalCode: string | null
  country: string
  establishedYear: number | null
  verified: boolean
  verifiedAt: string | null
  notificationPrefs: NotificationPrefs
  updatedAt: string
}

export interface SupplierStats {
  avgLeadDays: number | null
  fulfillmentRate: number | null
  avgResponseHrs: number | null
  totalSlabsSold: number
  warehouseCount: number
  updatedAt: string | null
}

export type NotificationChannel = 'inApp' | 'email' | 'sms'

export interface NotificationPrefEntry {
  inApp: boolean
  email: boolean
  sms: boolean
}

export interface NotificationPrefs {
  new_po: NotificationPrefEntry
  po_unacked_24h: NotificationPrefEntry
  connection_requested: NotificationPrefEntry
  connection_approved: NotificationPrefEntry
  price_changed: NotificationPrefEntry
  low_stock_warning: NotificationPrefEntry
}

export interface UpdateProfileRequest {
  displayName: string
  description?: string
  website?: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  stateProvince?: string
  postalCode?: string
  country?: string
  establishedYear?: number | null
}
