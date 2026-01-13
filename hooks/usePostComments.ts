"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"

export type PostComment = {
  user: {
    _id: string
    username: string
    profile_picture?: { url?: string } | null
    timeZone?: string | null
  }
  comment: string
  created_at: string
}

type CommentsResponse = {
  data?: PostComment[]
  page?: number
  totalPages?: number
}

export function usePostComments(postId: string | undefined) {
  const [items, setItems] = useState<PostComment[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState<number | null>(null)

  const [loading, setLoading] = useState(false) // only for first load
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inFlightRef = useRef(false)
  const postIdRef = useRef<string | undefined>(postId)

  useEffect(() => {
    postIdRef.current = postId
  }, [postId])

  const hasMore = useMemo(() => {
    if (totalPages == null) return true
    return page < totalPages
  }, [page, totalPages])

  const fetchPage = useCallback(async (p: number) => {
    const id = postIdRef.current
    if (!id) return
    if (inFlightRef.current) return

    inFlightRef.current = true
    setError(null)

    const first = p === 1
    if (first) setLoading(true)
    else setLoadingMore(true)

    try {
      const qs = new URLSearchParams({
        page: String(p),
        maxPageSize: "10",
      })

      const res = await apiFetch(`${API_URL}/post/${id}/comments?${qs}`, {
        method: "GET",
        cache: "no-store",
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Request failed (${res.status})`)
      }

      const json = (await res.json().catch(() => ({}))) as CommentsResponse
      const newItems = Array.isArray(json?.data) ? json.data : []
      const tp = typeof json?.totalPages === "number" ? json.totalPages : null

      setTotalPages(tp)
      setItems((prev) => (first ? newItems : [...prev, ...newItems]))
      setPage(p)
    } catch (e: any) {
      setError(e?.message || "Failed to load comments")
    } finally {
      inFlightRef.current = false
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // only reset + fetch when postId changes
  useEffect(() => {
    if (!postId) return
    setItems([])
    setPage(1)
    setTotalPages(null)
    setError(null)
    fetchPage(1)
  }, [postId, fetchPage])

  const loadMore = useCallback(() => {
    if (!hasMore) return
    fetchPage(page + 1)
  }, [hasMore, fetchPage, page])

  const reload = useCallback(() => {
    fetchPage(1)
  }, [fetchPage])

  return { items, loading, loadingMore, error, hasMore, loadMore, reload }
}
