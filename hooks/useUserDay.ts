"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"

type ApiOk<T> = { code?: number; message?: string; data: T }
type DayResponse = {
  user: any
  date: string
  timeZone: string
  stats: { notesCount: number; tasksCount: number; eventsCount: number }
  tasks: any[]
  notes: any[]
  events: any[]
}

type PostsResponse = {
  message?: string
  data: any[]
}

function safeApiMessage(err: any) {
  // you asked for JSON.parse(error?.message).message
  try {
    return JSON.parse(err?.message).message || "Something went wrong."
  } catch {
    return "Something went wrong."
  }
}

export function useUserDay(username: string, dateParam: string) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [day, setDay] = useState<DayResponse | null>(null)
  const [posts, setPosts] = useState<any[]>([])

  const key = useMemo(() => `${username}::${dateParam}`, [username, dateParam])

  const reload = useCallback(async () => {
    if (!username || !dateParam) return
    setLoading(true)
    setError(null)

    try {
      const [dayRes, postsRes] = await Promise.all([
        apiFetch(
          `${API_URL}/day/${encodeURIComponent(
            username
          )}?date=${encodeURIComponent(dateParam)}`,
          { method: "GET", cache: "no-store" }
        ),
        apiFetch(
          `${API_URL}/${encodeURIComponent(
            username
          )}/posts/${encodeURIComponent(dateParam)}`,
          { method: "GET", cache: "no-store" }
        ),
      ])

      if (!dayRes.ok) {
        const text = await dayRes.text().catch(() => "")
        throw new Error(
          text || JSON.stringify({ message: `Day failed (${dayRes.status})` })
        )
      }
      if (!postsRes.ok) {
        const text = await postsRes.text().catch(() => "")
        throw new Error(
          text ||
            JSON.stringify({ message: `Posts failed (${postsRes.status})` })
        )
      }

      const dayJson = (await dayRes.json()) as ApiOk<DayResponse>
      const postsJson = (await postsRes.json()) as PostsResponse

      setDay(dayJson.data)
      setPosts(Array.isArray(postsJson.data) ? postsJson.data : [])
    } catch (err: any) {
      setError(safeApiMessage(err))
      setDay(null)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [name, dateParam])

  useEffect(() => {
    reload()
  }, [reload, key])

  return { loading, error, day, posts, reload }
}
