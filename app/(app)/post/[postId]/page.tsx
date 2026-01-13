"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { apiFetch } from "@/lib/authClient"
import type { FeedPost } from "@/lib/feedTypes"
import PostDetailCard from "@/components/Post/PostDetailCard"
import CommentsSection from "@/components/Post/CommentsSection"

import { API_URL } from "@/config"

type UserInfo = {
  _id: string
  username: string
  profile_picture?: { url?: string } | null
  timeZone?: string | null
}

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>()
  const router = useRouter()

  const [post, setPost] = useState<FeedPost | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [postedAt, setPostedAt] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!postId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const res = await apiFetch(`${API_URL}/post/${postId}`, {
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
        const normalizedUser: UserInfo | null = ui?._id
          ? {
              _id: String(ui._id),
              username: String(ui.username || ""),
              profile_picture: ui.profile_picture ?? null,
              timeZone: ui.timeZone ?? null,
            }
          : null

        const normalizedPost: FeedPost = {
          id: String(raw._id),
          date: raw.date,
          time: "", // we format on the detail card from "date"
          content: String(raw.data || ""),
          media: Array.isArray(raw.media) ? raw.media : [],
          likes: raw.likes ?? 0,
          comments: raw.comments ?? 0,
          userLiked: !!raw.userLiked,
          userCommented: raw.userCommented ?? false,
        }

        if (!cancelled) {
          setUser(normalizedUser)
          setPost(normalizedPost)
          setPostedAt(String(raw.date || ""))
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load post")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [postId])

  return (
    <main className="pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto border-x border-(--dk-ink)/10 bg-(--dk-paper) min-h-screen">
        {/* Twitter-like top bar */}
        <div className="sticky top-0 bg-(--dk-paper)/95 backdrop-blur-md">
          <div className="h-1 w-full bg-(--dk-sky)/70" />
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-(--dk-mist) transition"
              aria-label="Back"
            >
              <ArrowLeft size={18} className="text-(--dk-ink)" />
            </button>

            <div className="leading-tight">
              <div className="text-sm font-semibold text-(--dk-ink)">Post</div>
              <div className="text-xs text-(--dk-slate)">Details</div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="px-4 py-6 text-sm text-(--dk-slate)">Loading…</div>
        )}

        {!loading && error && (
          <div className="px-4 py-6 text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && post && user && (
          <>
            <PostDetailCard post={post} user={user} postedAt={postedAt} />
            <CommentsSection postId={post.id} />
          </>
        )}
      </div>
    </main>
  )
}
