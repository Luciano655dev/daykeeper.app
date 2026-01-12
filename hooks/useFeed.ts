"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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

export function useFeed(selectedDate: Date) {
  const dateParam = useMemo(() => toDDMMYYYY(selectedDate), [selectedDate])

  const [items, setItems] = useState<FeedUserDay[]>([])
  const [loadingFirst, setLoadingFirst] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // prevents double-fetch if intersection fires multiple times
  const inFlightRef = useRef(false)

  const hasMore = page < totalPages

  const fetchPage = useCallback(
    async (targetPage: number, mode: "replace" | "append") => {
      if (inFlightRef.current) return
      inFlightRef.current = true

      setError(null)
      if (mode === "replace") setLoadingFirst(true)
      else setLoadingMore(true)

      try {
        const qs = new URLSearchParams({
          date: dateParam,
          page: String(targetPage),
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

        const json = (await res.json().catch(() => ({}))) as FeedResponse

        const normalized = normalizeFeedPayload(json) as FeedUserDay[]

        setPage(json.page ?? targetPage)
        setTotalPages(json.totalPages ?? 1)
        setTotalCount(json.totalCount ?? 0)

        setItems((prev) => {
          if (mode === "replace") return normalized

          // ✅ de-dupe by userId so you don’t duplicate when server shifts
          const map = new Map<string | number, FeedUserDay>()
          for (const it of prev) map.set(it.userId, it)
          for (const it of normalized) map.set(it.userId, it)
          return Array.from(map.values())
        })
      } catch (e: any) {
        setError(e?.message || "Failed to load feed")
        if (mode === "replace") setItems([])
      } finally {
        if (mode === "replace") setLoadingFirst(false)
        else setLoadingMore(false)
        inFlightRef.current = false
      }
    },
    [dateParam]
  )

  // ✅ initial load + reset when date changes
  useEffect(() => {
    setItems([])
    setPage(1)
    setTotalPages(1)
    setTotalCount(0)
    fetchPage(1, "replace")
  }, [fetchPage])

  const reload = useCallback(() => {
    // re-fetch page 1
    setItems([])
    setPage(1)
    setTotalPages(1)
    setTotalCount(0)
    fetchPage(1, "replace")
  }, [fetchPage])

  const loadMore = useCallback(() => {
    if (!hasMore) return
    if (loadingFirst || loadingMore) return
    fetchPage(page + 1, "append")
  }, [fetchPage, hasMore, loadingFirst, loadingMore, page])

  return {
    data: items,
    loading: loadingFirst, // keep your current prop usage
    loadingFirst,
    loadingMore,
    error,
    reload,
    loadMore,
    hasMore,
    page,
    totalPages,
    totalCount,
    usersCount: totalCount, // if you want “X users posted”
    dateParam,
  }
}
