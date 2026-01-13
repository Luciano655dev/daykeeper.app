"use client"

import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query"
import { apiJson } from "@/lib/api"

export function useApiInfiniteQuery<TPage>(
  key: any[],
  getUrl: (pageParam: number) => string,
  options: Omit<
    UseInfiniteQueryOptions,
    "queryKey" | "queryFn" | "initialPageParam"
  > & { initialPageParam?: number }
) {
  return useInfiniteQuery({
    queryKey: key,
    initialPageParam: options.initialPageParam ?? 1,
    queryFn: ({ pageParam }) => apiJson<TPage>(getUrl(Number(pageParam))),
    ...options,
  })
}
