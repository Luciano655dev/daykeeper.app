"use client"

import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"

type ApiOk<T> = { message?: string; data: T }

export type TaskPrivacy = "public" | "close friends" | "private"

export type ApiTaskDetail = {
  _id: string
  user: string
  title: string
  completed?: boolean
  privacy: TaskPrivacy
  date?: string
  dateLocal?: string
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

async function fetchTaskDetail(taskId: string) {
  const url = `${API_URL}/day/task/${encodeURIComponent(taskId)}`
  const res = await apiFetch(url, { method: "GET" })
  const json = await readJsonSafe<ApiOk<ApiTaskDetail>>(res)

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

export function useTaskDetail(taskId: string | null) {
  return useQuery({
    queryKey: ["taskDetail", taskId],
    enabled: !!taskId,
    queryFn: () => fetchTaskDetail(String(taskId)),
    staleTime: 30_000,
  })
}
