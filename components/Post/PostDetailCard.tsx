// components/Post/PostDetailCard.tsx
"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Clock,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Flag,
  Ban,
  Trash2,
} from "lucide-react"
import FeedPostMediaStrip from "@/components/Feed/FeedPostMediaStrip"
import { apiFetch } from "@/lib/authClient"
import type { FeedPost } from "@/lib/feedTypes"
import { API_URL } from "@/config"
import { useRouter } from "next/navigation"
import PrivacyChip from "@/components/common/PrivacyChip"
import ReportPostModal from "@/components/common/ReportPostModal"
import BlockUserModal from "@/components/common/BlockUserModal"
import DeletePostModal from "@/components/common/DeletePostModal"

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
  postedAt?: string
  isOwner: boolean
}

function parseBackendDate(dateStr?: string) {
  if (!dateStr || typeof dateStr !== "string") return null
  if (dateStr.includes("T")) {
    const d = new Date(dateStr)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const d = new Date(dateStr.replace(" ", "T"))
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

export default function PostDetailCard({
  post,
  user,
  postedAt,
  isOwner,
}: Props) {
  const router = useRouter()

  // like state
  const [liked, setLiked] = useState(!!post.userLiked)
  const [likesCount, setLikesCount] = useState<number>(post.likes ?? 0)
  const [likeBusy, setLikeBusy] = useState(false)

  // menu state
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // modals
  const [reportOpen, setReportOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const postId = useMemo(() => post.id, [post.id])
  const stamp = useMemo(
    () => formatTwitterStamp(postedAt || post.date, user?.timeZone),
    [postedAt, post.date, user?.timeZone]
  )

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
    setLikesCount((c) =>
      nextLiked ? (Number.isFinite(c) ? c + 1 : 1) : Math.max(0, (c ?? 0) - 1)
    )

    setLikeBusy(true)

    try {
      const res = await apiFetch(`${API_URL}/post/${postId}/like`, {
        method: "POST",
        cache: "no-store",
      })
      if (!res.ok) throw new Error()
    } catch {
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
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            className="flex items-start gap-3 text-left min-w-0"
            onClick={() => router.push(`/${user?.username}`)}
          >
            <Image
              src={avatarSrc}
              alt={user?.username || "User"}
              width={44}
              height={44}
              className="h-11 w-11 rounded-sm object-cover"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-(--dk-ink) truncate">
                  {user?.username}
                </p>
                <p className="text-sm text-(--dk-slate) truncate">{handle}</p>
              </div>

              <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-(--dk-slate)">
                {stamp && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} />
                    {stamp}
                  </span>
                )}
                <PrivacyChip privacy={post.privacy} />
              </div>
            </div>
          </button>

          {/* menu */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setMenuOpen((v) => !v)
              }}
              className="p-2 rounded-lg hover:bg-(--dk-ink)/5 transition text-(--dk-slate)"
              aria-label="Post options"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen && (
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
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-(--dk-ink)/5 transition"
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
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                      Delete post
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setReportOpen(true)
                      }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-(--dk-ink)/5 transition"
                    >
                      <Flag size={16} />
                      Report post
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setBlockOpen(true)
                      }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 transition"
                    >
                      <Ban size={16} />
                      Block user
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* content */}
        <div className="mt-3">
          <p className="text-(--dk-ink) text-[17px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

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
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
            <span className="font-medium">{likesCount}</span>
          </button>

          <button className="flex items-center gap-2 text-sm hover:text-(--dk-sky) transition">
            <MessageCircle size={16} />
            <span className="font-medium">{post.comments ?? 0}</span>
          </button>
        </div>
      </div>

      {/* modals */}
      {!isOwner ? (
        <>
          <ReportPostModal
            postId={String(postId)}
            open={reportOpen}
            onClose={() => setReportOpen(false)}
          />

          <BlockUserModal
            username={String(user?.username)}
            open={blockOpen}
            onClose={() => setBlockOpen(false)}
          />
        </>
      ) : null}

      {isOwner ? (
        <DeletePostModal
          postId={String(postId)}
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => {
            router.push(`/${user?.username}`)
            router.refresh()
          }}
        />
      ) : null}
    </article>
  )
}
