import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bundlesApi, type CreateBundleBody, type UpdateBundleBody } from '@/lib/api/supplier/bundles'

const KEYS = {
  all:    (search?: string) => ['bundles', search ?? ''] as const,
  one:    (id: string)      => ['bundles', id]           as const,
}

export function useBundles(search?: string) {
  return useQuery({
    queryKey: KEYS.all(search),
    queryFn:  () => bundlesApi.list(search),
  })
}

export function useBundle(id: string) {
  return useQuery({
    queryKey: KEYS.one(id),
    queryFn:  () => bundlesApi.get(id),
    enabled:  !!id,
  })
}

export function useCreateBundle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBundleBody) => bundlesApi.create(body),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['bundles'] }),
  })
}

export function useUpdateBundle(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateBundleBody) => bundlesApi.update(id, body),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['bundles'] })
      qc.invalidateQueries({ queryKey: KEYS.one(id) })
    },
  })
}
