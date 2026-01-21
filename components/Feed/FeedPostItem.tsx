"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import {
  Clock,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Flag,
  Pencil,
  Trash2,
} from "lucide-react"
import FeedPostMediaStrip from "./FeedPostMediaStrip"
import { apiFetch } from "@/lib/authClient"
import { useRouter } from "next/navigation"
import PrivacyChip from "@/components/common/PrivacyChip"
import { API_URL } from "@/config"
import formatDDMMYYYY from "@/utils/formatDate"
import DeleteEntityModal from "@/components/common/DeleteEntityModal"
import ReportEntityModal from "@/components/common/ReportEntityModal"
import { useQueryClient } from "@tanstack/react-query"

type Props = {
  post: any
  isLast: boolean
  isOwner?: boolean
}

export default function FeedPostItem({ post, isLast }: Props) {
  const isOwner = useMemo(() => post?.isOwner, [post?.isOwner])

  const [liked, setLiked] = useState(!!post.userLiked)
  const [likesCount, setLikesCount] = useState<number>(post.likes ?? 0)
  const [likeBusy, setLikeBusy] = useState(false)

  const router = useRouter()
  const qc = useQueryClient()
  const postId = useMemo(() => post.id, [post.id])

  // menu state
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // report modal
  const [reportOpen, setReportOpen] = useState(false)

  // delete modal
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }

    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDown)
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
        {/* top row with menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Clock size={14} className="text-(--dk-slate)" />
            <span className="text-xs font-medium text-(--dk-slate)">
              {post?.time?.toLowerCase() || ""}
            </span>

            {post?.edited_at ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-(--dk-slate)">
                <Pencil size={14} className="text-(--dk-slate)" />
                <span>{formatDDMMYYYY(post.edited_at)}</span>
              </span>
            ) : null}

            <PrivacyChip privacy={post.privacy} />
          </div>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setMenuOpen((v) => !v)
              }}
              className="p-2 rounded-lg hover:bg-(--dk-ink)/5 transition text-(--dk-slate)"
              aria-label="Options"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen ? (
              <div
                className="absolute right-0 mt-2 w-44 rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper) shadow-lg overflow-hidden z-20"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        router.push(`/post/${post.id}/edit`)
                      }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition hover:bg-(--dk-ink)/5"
                    >
                      <Pencil size={16} />
                      Edit post
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setDeleteOpen(true)
                      }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Delete post
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      setReportOpen(true)
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition hover:bg-(--dk-ink)/5"
                  >
                    <Flag size={16} />
                    Report post
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <p className="mt-2 text-(--dk-ink) text-[15px] leading-relaxed">
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
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              router.push(`/post/${post.id}`)
            }}
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

      {/* report modal (generic) */}
      <ReportEntityModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        entityLabel="post"
        entityId={String(postId)}
        buildPath={({ id }) => `/post/${encodeURIComponent(id)}/report`}
        onReported={() => {}}
      />

      {/* delete modal */}
      <DeleteEntityModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => {
          qc.removeQueries({ queryKey: ["postDetail", postId] })
          router.refresh()
        }}
        entityLabel="post"
        entityId={String(postId)}
        buildPath={({ id }) => `/post/${encodeURIComponent(id)}`}
        confirmTitle="Delete post"
        confirmButtonText="Delete post"
        successTitle="Post deleted"
      />
    </div>
  )
}
