"use client"

import { useCallback, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"

export type FollowRequestItem = {
  _id: string
  username?: string
  displayName?: string
  bio?: string
  profile_picture?: { url?: string } | null
}

type FollowRequestsResponse = {
  message?: string
  data?: FollowRequestItem[]
  page?: number
  pageSize?: number
  maxPageSize?: number
  totalPages?: number
  totalCount?: number
}

const PAGE_SIZE = 20

async function fetchFollowRequestsPage(
  page: number
): Promise<FollowRequestsResponse> {
  const qs = new URLSearchParams({
    page: String(page),
    maxPageSize: String(PAGE_SIZE),
  })

  const res = await apiFetch(`${API_URL}/follow_requests?${qs.toString()}`, {
    method: "GET",
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed (${res.status})`)
  }

  return (await res.json().catch(() => ({}))) as FollowRequestsResponse
}

export function useFollowRequests() {
  const q = useInfiniteQuery({
    queryKey: ["followRequests"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchFollowRequestsPage(Number(pageParam)),
    getNextPageParam: (lastPage) => {
      const page = lastPage?.page ?? 1
      const totalPages = lastPage?.totalPages
      const count = Array.isArray(lastPage?.data) ? lastPage!.data!.length : 0

      if (typeof totalPages === "number") {
        return page < totalPages ? page + 1 : undefined
      }

      return count < PAGE_SIZE ? undefined : page + 1
    },
  })

  const items = useMemo(() => {
    const pages = q.data?.pages ?? []
    return pages.flatMap((p) => (Array.isArray(p?.data) ? p.data : []))
  }, [q.data])

  const loadMore = useCallback(() => {
    if (!q.hasNextPage) return
    if (q.isFetching || q.isFetchingNextPage) return
    q.fetchNextPage()
  }, [q])

  const reload = useCallback(() => {
    q.refetch()
  }, [q])

  const totalCount = q.data?.pages?.[0]?.totalCount ?? 0

  return {
    items,
    loading: q.isLoading,
    loadingMore: q.isFetchingNextPage,
    error: q.error ? (q.error as any).message : null,
    hasMore: !!q.hasNextPage,
    loadMore,
    reload,
    totalCount,
  }
}
