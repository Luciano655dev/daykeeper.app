"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { apiJson } from "@/lib/api"

export function useApiQuery<T>(
  key: any[],
  url: string,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => apiJson<T>(url),
    ...options,
  })
}
