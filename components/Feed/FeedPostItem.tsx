"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Clock, Heart, MessageCircle, MoreHorizontal, Flag } from "lucide-react"
import type { FeedPost } from "@/lib/feedTypes"
import FeedPostMediaStrip from "./FeedPostMediaStrip"
import { apiFetch } from "@/lib/authClient"
import { useRouter } from "next/navigation"
import ReportPostModal from "./ReportPostModal"
import { API_URL } from "@/config"

type Props = {
  post: FeedPost
  isLast: boolean
}

export default function FeedPostItem({ post, isLast }: Props) {
  const [liked, setLiked] = useState(!!post.userLiked)
  const [likesCount, setLikesCount] = useState<number>(post.likes ?? 0)
  const [likeBusy, setLikeBusy] = useState(false)

  const router = useRouter()
  const postId = useMemo(() => post.id, [post.id])

  // menu state
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // report modal
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (menuRef.current.contains(e.target as Node)) return
      setMenuOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }

    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onEsc)
    }
  }, [])

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
    } catch {
      setLiked(prevLiked)
      setLikesCount(prevCount)
    } finally {
      setLikeBusy(false)
    }
  }

  return (
    <div className="relative">
      {/* dot */}
      <div
        className="absolute top-5 w-3 h-3 rounded-full bg-(--dk-sky) shadow-sm"
        style={{ left: 0, transform: "translateX(-50%)" }}
      />

      {/* connector */}
      {!isLast ? (
        <div
          className="absolute top-8 w-px bg-(--dk-sky)/40"
          style={{
            left: 0,
            transform: "translateX(-50%)",
            height: "calc(100% + 1rem)",
          }}
        />
      ) : null}

      {/* card */}
      <div
        className="ml-8 bg-(--dk-paper)/70 rounded-xl p-4 hover:bg-(--dk-paper)/90 transition cursor-pointer border border-(--dk-ink)/10"
        onClick={() => router.push(`/post/${post.id}`)}
      >
        {/* top row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-(--dk-slate)" />
            <span className="text-xs font-medium text-(--dk-slate)">
              {post.time || ""}
            </span>
          </div>

          {/* ... menu */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setMenuOpen((v) => !v)
              }}
              className="p-1.5 rounded-lg hover:bg-(--dk-ink)/5 text-(--dk-slate) hover:text-(--dk-ink) transition"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Post options"
            >
              <MoreHorizontal size={16} />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-44 rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper) shadow-lg overflow-hidden z-20"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setMenuOpen(false)
                    setReportOpen(true)
                  }}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-(--dk-ink)/5 transition text-(--dk-ink)"
                >
                  <Flag size={16} />
                  Report post
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <p className="text-(--dk-ink) text-[15px] leading-relaxed">
          {post.content}
        </p>

        <FeedPostMediaStrip media={post.media} />

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
              post.userCommented ? "text-(--dk-sky)" : "hover:text-(--dk-sky)"
            }`}
          >
            <MessageCircle
              size={14}
              strokeWidth={2}
              className="transition"
              fill={post.userCommented ? "currentColor" : "none"}
            />
            <span>{post.comments ?? 0}</span>
          </button>
        </div>
      </div>

      {/* extracted modal */}
      <ReportPostModal
        postId={String(postId)}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </div>
  )
}
