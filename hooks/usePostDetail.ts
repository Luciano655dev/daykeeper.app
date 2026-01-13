"use client"

import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/authClient"
import type { FeedPost } from "@/lib/feedTypes"
import { API_URL } from "@/config"

type UserInfo = {
  _id: string
  username: string
  profile_picture?: { url?: string } | null
  timeZone?: string | null
}

type PostDetailResult = {
  post: FeedPost
  user: UserInfo
  postedAt: string
}

async function fetchPostDetail(postId: string): Promise<PostDetailResult> {
  const res = await apiFetch(`${API_URL}/post/${encodeURIComponent(postId)}`, {
    method: "GET",
    cache: "no-store",
  })

  if (res.status === 404) throw new Error("Post not found")

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed (${res.status})`)
  }

  const json = await res.json().catch(() => ({}))
  const raw = json?.data
  if (!raw?._id) throw new Error("Post not found")

  const ui = raw.user_info
  const user: UserInfo = {
    _id: String(ui?._id || ""),
    username: String(ui?.username || ""),
    profile_picture: ui?.profile_picture ?? null,
    timeZone: ui?.timeZone ?? null,
  }

  const post: FeedPost = {
    id: String(raw._id),
    date: raw.date,
    time: "",
    content: String(raw.data || ""),
    media: Array.isArray(raw.media) ? raw.media : [],
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    userLiked: !!raw.userLiked,
    userCommented: raw.userCommented ?? false,
  }

  return { post, user, postedAt: String(raw.date || "") }
}

export function usePostDetail(postId: string | undefined) {
  return useQuery({
    queryKey: ["postDetail", postId],
    enabled: !!postId,
    queryFn: () => fetchPostDetail(String(postId)),
  })
}
