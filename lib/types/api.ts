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
