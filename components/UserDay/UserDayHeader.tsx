"use client"

import Image from "next/image"
import { MoreHorizontal, Flag, Ban } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"

import ReportEntityModal from "@/components/common/ReportEntityModal"

const AVATAR_FALLBACK = "/avatar-placeholder.png"

/* ---------- tiny modal shell ---------- */
function ModalShell({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onEsc)
    return () => document.removeEventListener("keydown", onEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative mx-auto mt-24 w-[92%] max-w-md rounded-2xl border border-(--dk-ink)/10 bg-(--dk-paper) shadow-xl">
        <div className="px-4 py-3 border-b border-(--dk-ink)/10">
          <div className="text-sm font-semibold text-(--dk-ink)">{title}</div>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

/* ---------- block user modal ---------- */
function BlockUserModal({
  userId,
  open,
  onClose,
  onBlocked,
}: {
  userId: string
  open: boolean
  onClose: () => void
  onBlocked?: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setBusy(false)
    setError(null)
  }, [open])

  async function block() {
    if (busy) return
    setBusy(true)
    setError(null)

    try {
      const res = await apiFetch(
        `${API_URL}/user/${encodeURIComponent(userId)}/block`,
        {
          method: "POST",
          cache: "no-store",
        },
      )

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Request failed (${res.status})`)
      }

      onBlocked?.()
      onClose()
    } catch (e: any) {
      setError(e?.message || "Failed to block user.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <ModalShell open={open} title="Block user" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-(--dk-slate)">
          They won’t be able to follow you, message you, or see your content.
        </p>

        {error ? <div className="text-xs text-red-600">{error}</div> : null}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-9 px-3 rounded-lg text-sm font-medium border border-(--dk-ink)/15 hover:bg-(--dk-mist) transition disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={block}
            disabled={busy}
            className="h-9 px-3 rounded-lg text-sm font-medium bg-red-600 text-white hover:opacity-90 transition disabled:opacity-60"
          >
            {busy ? "Blocking…" : "Block"}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

/* ---------- header with menu + modals ---------- */
export default function UserDayHeader({
  user,
  nameFallback,
  onToggleFollow,
  followBusy,
}: {
  user: any
  nameFallback?: string
  onToggleFollow?: () => void
  followBusy?: boolean
}) {
  const router = useRouter()
  const avatarSrc = user?.profile_picture?.url || AVATAR_FALLBACK

  const displayName =
    user?.displayName || user?.username || nameFallback || "User"
  const handle = user?.handle || user?.username || nameFallback || ""

  const followInfo = user?.follow_info
  const isFollowing = user?.isFollowing
  const isSelf = followInfo === "same_user"

  const userId = useMemo(
    () => String(user?._id || user?.id || user?.userId || ""),
    [user],
  )

  // menu
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // modals
  const [reportOpen, setReportOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)

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

  return (
    <section className="px-4 py-4">
      <div className="flex items-center gap-3">
        <Image
          src={avatarSrc}
          alt={displayName}
          width={48}
          height={48}
          className="h-12 w-12 rounded-sm object-cover cursor-pointer"
          onClick={() => router.push(`/${user?.username}`)}
        />

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => router.push(`/${user?.username}`)}
        >
          <div className="text-[16px] font-semibold text-(--dk-ink) truncate">
            {displayName}
          </div>
          <div className="text-sm text-(--dk-slate) truncate">@{handle}</div>
        </div>

        {!isSelf ? (
          <button
            type="button"
            onClick={onToggleFollow}
            disabled={followBusy}
            className={
              "h-9 px-3 rounded-lg text-sm font-medium border transition " +
              (isFollowing
                ? "bg-(--dk-paper) border-(--dk-ink)/15 hover:bg-(--dk-mist)"
                : "bg-(--dk-sky) text-white border-(--dk-sky) hover:opacity-90")
            }
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        ) : null}

        {/* menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setMenuOpen((v) => !v)
            }}
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-(--dk-mist) transition"
            aria-label="User options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={18} className="text-(--dk-ink)" />
          </button>

          {menuOpen && !isSelf ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper) shadow-lg overflow-hidden z-20"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  setReportOpen(true)
                }}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-(--dk-ink)/5 transition text-(--dk-ink)"
              >
                <Flag size={16} />
                Report user
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  setBlockOpen(true)
                }}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-(--dk-ink)/5 transition text-(--dk-ink)"
              >
                <Ban size={16} />
                Block user
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* modals */}
      {!isSelf && userId ? (
        <>
          <ReportEntityModal
            open={reportOpen}
            onClose={() => setReportOpen(false)}
            entityLabel="user"
            entityId={String(userId)}
            buildPath={({ id }) => `/user/${encodeURIComponent(id)}/report`}
            defaultReason="spam"
          />

          <BlockUserModal
            userId={userId}
            open={blockOpen}
            onClose={() => setBlockOpen(false)}
            onBlocked={() => {
              router.push("/feed")
              router.refresh()
            }}
          />
        </>
      ) : null}
    </section>
  )
}
