export type SlabStatus = 'available' | 'reserved' | 'allocated' | 'shipped' | 'hold' | 'sold'

export type MaterialType =
  | 'granite' | 'marble' | 'quartzite' | 'quartz' | 'porcelain'
  | 'dekton' | 'limestone' | 'travertine' | 'onyx' | 'slate' | 'soapstone' | 'other'

export type ColorFamily =
  | 'white' | 'cream' | 'beige' | 'gray' | 'charcoal'
  | 'black' | 'blue' | 'green' | 'red' | 'brown' | 'gold' | 'multi'

export type Finish = 'polished' | 'honed' | 'leathered' | 'brushed' | 'sandblasted' | 'flamed' | 'natural'

export type QualityGrade = 'A' | 'B' | 'C'

export interface SupplierSlabDto {
  id: string
  internalRef: string
  barcode: string | null
  materialType: MaterialType
  materialName: string
  colorFamily: ColorFamily | null
  pattern: string | null
  finish: Finish
  qualityGrade: QualityGrade
  thicknessCm: number
  grossLengthMm: number
  grossWidthMm: number
  netSqft: number
  netSqm: number
  weightKg: number | null
  originCountry: string | null
  quarryName: string | null
  lotNumber: string | null
  blockNumber: string | null
  warehouseId: string | null
  warehouseName: string | null
  rackLocation: string | null
  status: SlabStatus
  statusChanged: string
  reservedForPoId: string | null
  isRemnant: boolean
  basePrice: number | null
  priceOverride: number | null
  effectivePrice: number | null
  primaryPhotoUrl: string | null
  primaryThumbUrl: string | null
  photoCount: number
  bundleId: string | null
  bundleRef: string | null
  createdAt: string
  updatedAt: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  perPage: number
  totalPages: number
}

export interface InventorySummary {
  available: number
  reserved: number
  hold: number
  allocated: number
  shipped: number
  totalSlabs: number
  totalSqftOnHand: number
}

export interface ApiError {
  status: number
  title: string
  detail?: string
  errors?: Record<string, string[]>
}

export interface WarehouseDto {
  id: string
  name: string
  addressLine1: string | null
  city: string | null
  stateProvince: string | null
  postalCode: string | null
  country: string
  phone: string | null
  isPrimary: boolean
  isActive: boolean
  slabCount: number
  availableCount: number
  reservedCount: number
  onHoldCount: number
  estimatedValue: number | null
  createdAt: string
  updatedAt: string
}

export interface BundleDto {
  id: string
  bundleRef: string
  materialName: string
  quarryName: string | null
  originCountry: string | null
  arrivalDate: string | null
  invoiceRef: string | null
  notes: string | null
  slabCount: number
  activeCount: number
  availableCount: number
  totalSqftAvailable: number | null
  createdAt: string
  updatedAt: string
}

export interface BundleSlabDto {
  id: string
  internalRef: string
  blockNumber: string | null
  thicknessCm: number
  finish: string
  grossLengthMm: number
  grossWidthMm: number
  netSqft: number
  qualityGrade: string
  status: SlabStatus
  rackLocation: string | null
  warehouseName: string | null
  priceOverride: number | null
  primaryPhotoUrl: string | null
  updatedAt: string
}

export interface BundleDetailDto extends BundleDto {
  slabs: BundleSlabDto[]
}

export interface SupplierSlabFilterParams {
  searchQuery?: string
  statuses?: SlabStatus[]
  materialTypes?: MaterialType[]
  colorFamilies?: ColorFamily[]
  finishes?: Finish[]
  thicknessMin?: number
  thicknessMax?: number
  minNetSqft?: number
  isRemnant?: boolean
  warehouseId?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  page?: number
  perPage?: number
}
