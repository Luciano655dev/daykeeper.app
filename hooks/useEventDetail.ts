"use client"

import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"

type ApiOk<T> = { message?: string; data: T }

export type EventPrivacy = "public" | "close friends" | "private"

export type ApiEventDetail = {
  _id: string
  user: string

  title: string
  description?: string
  privacy: EventPrivacy

  dateStart?: string
  dateStartLocal?: string
  dateEnd?: string
  dateEndLocal?: string

  createdAt?: string
  createdAtLocal?: string
  created_at?: string
  dateCreated?: string
  date?: string

  edited_at?: string

  user_info?: {
    _id?: string
    username?: string
    displayName?: string
    profile_picture?: { url?: string }
  }
}

async function readJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T
  } catch {
    return null
  }
}

async function fetchEventDetail(eventId: string) {
  const url = `${API_URL}/day/event/${encodeURIComponent(eventId)}`
  const res = await apiFetch(url, { method: "GET" })
  const json = await readJsonSafe<ApiOk<ApiEventDetail>>(res)

  if (!res.ok) {
    const msg =
      (json as any)?.message ||
      (json as any)?.error ||
      `Request failed (${res.status})`
    throw new Error(msg)
  }

  if (!json?.data) throw new Error("Invalid server response.")
  return json.data
}

export function useEventDetail(eventId: string | null) {
  return useQuery({
    queryKey: ["eventDetail", eventId],
    enabled: !!eventId,
    queryFn: () => fetchEventDetail(String(eventId)),
    staleTime: 30_000,
  })
}
