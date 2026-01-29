"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, MessageCircle } from "lucide-react"

import ContentHeader from "@/components/common/ContentHeader"
import FeedPostMediaStrip from "@/components/Feed/FeedPostMediaStrip"
import RichText from "@/components/common/RichText"

import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"
import formatDDMMYYYY from "@/utils/formatDate"

function formatPostedAt(s?: string) {
  if (!s) return ""
  const d = new Date(s)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  return `${time} · ${dd}/${mm}/${yyyy}`
}

export default function SearchPostResultCard({ post }: { post: any }) {
  const router = useRouter()

  const postId = useMemo(() => post?.id || post?._id, [post])
  const user = post?.user_info || post?.user || null

  const createdAt = post?.created_at || post?.createdAt || post?.date
  const editedAt = post?.edited_at || post?.editedAt

  const stamp = useMemo(() => formatPostedAt(createdAt), [createdAt])
  const editedDate = useMemo(
    () => (editedAt ? formatDDMMYYYY(editedAt) : ""),
    [editedAt],
  )

  const privacy = post?.privacy || post?.status

  const [liked, setLiked] = useState(!!post?.userLiked)
  const [likesCount, setLikesCount] = useState<number>(Number(post?.likes ?? 0))
  const [likeBusy, setLikeBusy] = useState(false)

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (likeBusy) return

    const prevLiked = liked
    const prevCount = likesCount

    const nextLiked = !prevLiked
    setLiked(nextLiked)
    setLikesCount((c) => {
      const base = Number.isFinite(c) ? c : 0
      return nextLiked ? base + 1 : Math.max(0, base - 1)
    })

    setLikeBusy(true)
    try {
      const res = await apiFetch(
        `${API_URL}/post/${encodeURIComponent(String(postId))}/like`,
        { method: "POST", cache: "no-store" },
      )
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Request failed (${res.status})`)
      }
    } catch {
      setLiked(prevLiked)
      setLikesCount(prevCount)
    } finally {
      setLikeBusy(false)
    }
  }

  const content = post?.content ?? post?.data ?? ""
  const comments = Number(post?.comments ?? 0)
  const userCommented = !!post?.userCommented

  return (
    <div
      className={[
        "rounded-2xl border border-(--dk-ink)/10 bg-(--dk-paper)",
        "hover:bg-(--dk-mist)/40 hover:border-(--dk-sky)/35 transition",
        "p-3 cursor-pointer",
      ].join(" ")}
      onClick={() => router.push(`/post/${encodeURIComponent(String(postId))}`)}
    >
      {/* header (avatar, username, @handle, time, edited, privacy chip) */}
      <ContentHeader
        user={user}
        stamp={stamp}
        editedDate={editedDate || undefined}
        privacy={privacy}
        onUserClick={() => {
          const username = user?.username
          if (username) router.push(`/${encodeURIComponent(String(username))}`)
        }}
        // search results: no menu here (you can add later if you want)
        menuItems={[]}
      />

      <p className="mt-2 text-(--dk-ink) text-[15px] leading-relaxed whitespace-pre-wrap">
        <RichText text={String(content || "")} />
      </p>

      <FeedPostMediaStrip media={post?.media || []} />

      {/* like/comment row (same behavior as your FeedPostItem) */}
      <div className="flex items-center gap-6 text-(--dk-slate) mt-3 pt-3 border-t border-(--dk-ink)/10">
        <button
          onClick={toggleLike}
          disabled={likeBusy}
          className={`flex items-center gap-1.5 text-xs cursor-pointer transition disabled:opacity-60 ${
            liked ? "text-(--dk-sky)" : "hover:text-(--dk-sky)"
          }`}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
        >
          <Heart
            size={14}
            strokeWidth={2}
            className="transition"
            fill={liked ? "currentColor" : "none"}
          />
          <span>{likesCount}</span>
        </button>

        <button
          className={`flex items-center gap-1.5 text-xs cursor-pointer transition ${
            userCommented ? "text-(--dk-sky)" : "hover:text-(--dk-sky)"
          }`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            router.push(`/post/${encodeURIComponent(String(postId))}`)
          }}
        >
          <MessageCircle
            size={14}
            strokeWidth={2}
            className="transition"
            fill={userCommented ? "currentColor" : "none"}
          />
          <span>{comments}</span>
        </button>
      </div>
    </div>
  )
}
