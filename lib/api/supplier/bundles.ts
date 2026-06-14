import { api } from '@/lib/api/client'
import type { BundleDto, BundleDetailDto } from '@/lib/types/api'

const BASE = '/api/v1/supplier/bundles'

export interface CreateBundleBody {
  bundleRef: string
  materialName: string
  quarryName?: string
  originCountry?: string
  arrivalDate?: string
  invoiceRef?: string
  notes?: string
}

export interface UpdateBundleBody extends CreateBundleBody {}

export const bundlesApi = {
  list:   (search?: string) => api.get<BundleDto[]>(`${BASE}${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get:    (id: string)      => api.get<BundleDetailDto>(`${BASE}/${id}`),
  create: (body: CreateBundleBody)             => api.post<BundleDto>(BASE, body),
  update: (id: string, body: UpdateBundleBody) => api.put<BundleDto>(`${BASE}/${id}`, body),
}
