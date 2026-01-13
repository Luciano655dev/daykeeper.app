"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"

type ApiOk<T> = { code?: number; message?: string; data: T }

export type DayResponse = {
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

type UserDayBundle = {
  day: DayResponse
  posts: any[]
}

function safeApiMessage(err: any) {
  try {
    return JSON.parse(err?.message).message || "Something went wrong."
  } catch {
    return err?.message || "Something went wrong."
  }
}

async function fetchUserDayBundle(
  username: string,
  dateParam: string
): Promise<UserDayBundle> {
  const [dayRes, postsRes] = await Promise.all([
    apiFetch(
      `${API_URL}/day/${encodeURIComponent(username)}?date=${encodeURIComponent(
        dateParam
      )}`,
      { method: "GET", cache: "no-store" }
    ),
    apiFetch(
      `${API_URL}/${encodeURIComponent(username)}/posts/${encodeURIComponent(
        dateParam
      )}`,
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
      text || JSON.stringify({ message: `Posts failed (${postsRes.status})` })
    )
  }

  const dayJson = (await dayRes
    .json()
    .catch(() => null)) as ApiOk<DayResponse> | null
  const postsJson = (await postsRes
    .json()
    .catch(() => null)) as PostsResponse | null

  const day = dayJson?.data
  if (!day)
    throw new Error(JSON.stringify({ message: "Day payload missing data" }))

  const posts = Array.isArray(postsJson?.data) ? postsJson!.data : []

  return { day, posts }
}

export function useUserDay(username: string, dateParam: string) {
  const key = useMemo(
    () => ["userDay", username, dateParam],
    [username, dateParam]
  )

  const q = useQuery<UserDayBundle, Error>({
    queryKey: key,
    queryFn: () => fetchUserDayBundle(username, dateParam),
    enabled: !!username && !!dateParam,
  })

  return {
    loading: q.isLoading,
    error: q.error ? safeApiMessage(q.error) : null,
    day: q.data?.day ?? null,
    posts: q.data?.posts ?? [],
    reload: q.refetch,
  }
}
