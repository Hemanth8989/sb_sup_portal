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

// ── Warehouses ────────────────────────────────────────────────────────────────

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

// ── Bundles ───────────────────────────────────────────────────────────────────

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

// ── Purchase Orders ───────────────────────────────────────────────────────────

export interface PurchaseOrderDto {
  id: string
  poNumber: string
  fabricatorId: string
  fabricatorName: string
  supplierId: string
  jobId: string | null
  status: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  shippingAmount: number
  totalAmount: number
  currency: string
  requestedDelivery: string | null
  confirmedDelivery: string | null
  trackingNumber: string | null
  carrier: string | null
  fabricatorNotes: string | null
  supplierNotes: string | null
  internalRef: string | null
  sentAt: string | null
  ackedAt: string | null
  shippedAt: string | null
  receivedAt: string | null
  createdAt: string
  updatedAt: string
  lineItems: PoLineItemDto[]
}

export interface PoLineItemDto {
  id: string
  variantId: string
  variantName: string
  sku: string
  slabId: string | null
  slabRef: string | null
  quantity: number
  unitOfMeasure: string
  unitPrice: number
  lineTotal: number
  status: string
  declineReason: string | null
  counterPrice: number | null
  counterNote: string | null
  updatedAt: string
}

// ── Connections ───────────────────────────────────────────────────────────────

export interface ConnectionDto {
  id: string
  fabricatorId: string
  fabricatorName: string
  fabricatorSlug: string
  supplierId: string
  status: 'pending' | 'active' | 'suspended' | 'declined' | 'terminated'
  pricingTier: string
  requestMessage: string | null
  declineReason: string | null
  fabricatorNotes: string | null
  requestedAt: string
  connectedAt: string | null
  suspendedAt: string | null
  terminatedAt: string | null
  updatedAt: string
  fabricatorCity: string | null
  fabricatorState: string | null
  fabricatorPhone: string | null
  assignedPriceListId: string | null
  assignedPriceListName: string | null
}

// ── Price Lists ───────────────────────────────────────────────────────────────

export interface PriceListDto {
  id: string
  name: string
  tier: string
  currency: string
  validFrom: string | null
  validTo: string | null
  isActive: boolean
  itemCount: number
  createdAt: string
  updatedAt: string
}

export interface PriceListItemDto {
  id: string
  variantId: string
  variantName: string
  sku: string
  unitPrice: number
  currency: string
}

export interface PriceListDetailDto extends PriceListDto {
  items: PriceListItemDto[]
}

// ── Product Inventory ─────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'discontinued' | 'out_of_stock'

export interface ProductVariantInventoryDto {
  id: string
  productId: string
  sku: string
  variantName: string
  unitOfMeasure: string
  basePrice: number
  currency: string
  qtyAvailable: number
  qtyReserved: number
  qtyOnHand: number
  status: ProductStatus
  leadTimeDays: number | null
  primaryPhotoUrl: string | null
  updatedAt: string
}

export interface ProductInventoryDto {
  id: string
  categoryCode: string
  categoryLabel: string
  name: string
  brand: string | null
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  variants: ProductVariantInventoryDto[]
}

export interface ProductInventoryFilterParams {
  categoryCode?: string
  search?: string
  status?: string
  page?: number
  perPage?: number
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
