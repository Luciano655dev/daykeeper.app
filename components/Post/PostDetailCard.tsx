"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { Clock, Heart, MessageCircle } from "lucide-react"
import FeedPostMediaStrip from "@/components/Feed/FeedPostMediaStrip"
import { apiFetch } from "@/lib/authClient"
import type { FeedPost } from "@/lib/feedTypes"
import { API_URL } from "@/config"
import { useRouter } from "next/navigation"

const AVATAR_FALLBACK = "/avatar-placeholder.png"

type UserInfo = {
  _id: string
  username: string
  profile_picture?: { url?: string } | null
  timeZone?: string | null
}

type Props = {
  post: FeedPost
  user: UserInfo
  postedAt?: string // your backend "date" string
}

function parseBackendDate(dateStr?: string) {
  // backend: "2026-01-07 10:50:29"
  if (!dateStr) return null
  if (typeof dateStr !== "string") return null

  // if already ISO, Date can parse it
  if (dateStr.includes("T")) {
    const d = new Date(dateStr)
    return Number.isNaN(d.getTime()) ? null : d
  }

  // convert "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
  const isoLike = dateStr.replace(" ", "T")
  const d = new Date(isoLike) // treated as local time
  return Number.isNaN(d.getTime()) ? null : d
}

function formatTwitterStamp(dateStr?: string, timeZone?: string | null) {
  const d = parseBackendDate(dateStr)
  if (!d) return ""

  const tz = timeZone || undefined

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  }).format(d)

  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: tz,
  }).format(d)

  return `${time} · ${date}`
}

export default function PostDetailCard({ post, user, postedAt }: Props) {
  const router = useRouter()
  // optimistic like state
  const [liked, setLiked] = useState(!!post.userLiked)
  const [likesCount, setLikesCount] = useState<number>(post.likes ?? 0)
  const [likeBusy, setLikeBusy] = useState(false)

  const postId = useMemo(() => post.id, [post.id])
  const stamp = useMemo(
    () => formatTwitterStamp(postedAt || post.date, user?.timeZone),
    [postedAt, post.date, user?.timeZone]
  )

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
      const res = await apiFetch(`${API_URL}/post/${postId}/like`, {
        method: "POST",
        cache: "no-store",
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Request failed (${res.status})`)
      }

      // Optional: if your API returns authoritative counts, set them here
      // const json = await res.json().catch(() => null)
      // if (json?.data?.likes != null) setLikesCount(json.data.likes)
      // if (json?.data?.userLiked != null) setLiked(!!json.data.userLiked)
    } catch {
      // revert on failure
      setLiked(prevLiked)
      setLikesCount(prevCount)
    } finally {
      setLikeBusy(false)
    }
  }

  const avatarSrc = user?.profile_picture?.url || AVATAR_FALLBACK
  const handle = user?.username ? `@${user.username}` : ""

  return (
    <article className="bg-(--dk-paper) border-b border-(--dk-ink)/10">
      <div className="px-4 pt-4 pb-2">
        {/* user row */}
        <div
          className="flex items-start gap-3 cursor-pointer"
          onClick={() => router.push(`/${user?.username}`)}
        >
          <Image
            src={avatarSrc}
            alt={user?.username || "User"}
            width={44}
            height={44}
            className="h-11 w-11 rounded-sm object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-(--dk-ink) truncate">
                {user?.username}
              </p>
              <p className="text-sm text-(--dk-slate) truncate">{handle}</p>
            </div>

            {/* timestamp like twitter */}
            {stamp ? (
              <div className="mt-1 flex items-center gap-2 text-xs text-(--dk-slate)">
                <Clock size={12} />
                <span>{stamp}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* content */}
        <div className="mt-3">
          <p className="text-(--dk-ink) text-[17px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {/* media */}
          <FeedPostMediaStrip media={post.media} />
        </div>

        {/* actions */}
        <div className="mt-4 pt-3 border-t border-(--dk-ink)/10 flex items-center gap-6 text-(--dk-slate)">
          <button
            onClick={toggleLike}
            disabled={likeBusy}
            className={`flex items-center gap-2 text-sm transition disabled:opacity-60 ${
              liked ? "text-(--dk-sky)" : "hover:text-(--dk-sky)"
            }`}
            aria-pressed={liked}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
            <span className="font-medium">{likesCount}</span>
          </button>

          <button
            className={`flex items-center gap-2 text-sm transition ${
              post.userCommented ? "text-(--dk-sky)" : "hover:text-(--dk-sky)"
            }`}
          >
            <MessageCircle
              size={16}
              fill={post.userCommented ? "currentColor" : "none"}
            />
            <span className="font-medium">{post.comments ?? 0}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
