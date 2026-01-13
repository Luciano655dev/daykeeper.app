"use client"

import { useQuery } from "@tanstack/react-query"
import { apiJson } from "@/lib/api"
import { API_URL } from "@/config"

export type ApiUser = {
  _id: string
  username: string
  email?: string
  bio?: string
  private?: boolean
  profile_picture?: { url?: string }
  created_at?: string
  timeZone?: string
  maxStreak?: number
  currentStreak?: number
  followers?: number
  following?: number
  isFollowing?: boolean
  roles?: string[]
}

type ApiOk<T> = { code?: number; message?: string; data: T }

export function useUserProfile(username: string | null) {
  return useQuery({
    queryKey: ["userProfile", username],
    enabled: !!username,
    queryFn: () =>
      apiJson<ApiOk<ApiUser>>(
        `${API_URL}/${encodeURIComponent(String(username))}`,
        { method: "GET" }
      ),
    select: (res) => res?.data ?? null,
  })
}
