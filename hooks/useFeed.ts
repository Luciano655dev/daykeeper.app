"use client"

import { useMemo, useCallback } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/authClient"
import { normalizeFeedPayload, type FeedUserDay } from "@/lib/feedTypes"
import { toDDMMYYYY } from "@/lib/date"
import { API_URL } from "@/config"

const PAGE_SIZE = 20

type FeedResponse = {
  data: any[]
  page: number
  pageSize: number
  maxPageSize: number
  totalPages: number
  totalCount: number
}

async function fetchFeedPage(
  dateParam: string,
  page: number
): Promise<FeedResponse> {
  const qs = new URLSearchParams({
    date: dateParam,
    page: String(page),
    maxPageSize: String(PAGE_SIZE),
  })

  const res = await apiFetch(`${API_URL}/?${qs.toString()}`, {
    method: "GET",
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed (${res.status})`)
  }

  return (await res.json().catch(() => ({}))) as FeedResponse
}

export function useFeed(selectedDate: Date) {
  const dateParam = useMemo(() => toDDMMYYYY(selectedDate), [selectedDate])

  const q = useInfiniteQuery({
    queryKey: ["feed", dateParam],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchFeedPage(dateParam, Number(pageParam)),
    getNextPageParam: (lastPage) => {
      const page = lastPage?.page ?? 1
      const totalPages = lastPage?.totalPages ?? 1
      return page < totalPages ? page + 1 : undefined
    },
    enabled: !!dateParam,
  })

  // flatten + normalize + de-dupe
  const items: FeedUserDay[] = useMemo(() => {
    const pages = q.data?.pages ?? []
    const all = pages.flatMap(
      (p) => (normalizeFeedPayload(p) as FeedUserDay[]) ?? []
    )

    // keep your de-dupe (useful if server shifts paging)
    const map = new Map<string | number, FeedUserDay>()
    for (const it of all) map.set(it.userId, it)
    return Array.from(map.values())
  }, [q.data])

  const last = q.data?.pages?.[q.data.pages.length - 1]
  const page = last?.page ?? 1
  const totalPages = last?.totalPages ?? 1
  const totalCount = last?.totalCount ?? 0

  const loadMore = useCallback(() => {
    if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage()
  }, [q])

  const reload = useCallback(() => {
    q.refetch()
  }, [q])

  return {
    data: items,

    // keep your prop names
    loading: q.isLoading,
    loadingFirst: q.isLoading,
    loadingMore: q.isFetchingNextPage,
    error: q.error ? (q.error as any).message : null,

    reload,
    loadMore,
    hasMore: !!q.hasNextPage,

    page,
    totalPages,
    totalCount,
    usersCount: totalCount,
    dateParam,
  }
}
