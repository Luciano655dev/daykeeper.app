"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, UserPlus } from "lucide-react"
import NotificationsList from "@/components/Notifications/NotificationsList"
import { useNotifications } from "@/hooks/useNotifications"
import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"

export default function NotificationsPage() {
  const router = useRouter()
  const [sessionNewIds, setSessionNewIds] = useState<Set<string>>(
    () => new Set()
  )
  const [isPrivate, setIsPrivate] = useState(false)
  const {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    reload,
    markRead,
    totalCount,
    unreadCount,
  } = useNotifications()

  useEffect(() => {
    let alive = true

    async function loadPrivacy() {
      try {
        const res = await apiFetch(`${API_URL}/auth/user`, { method: "GET" })
        if (!res.ok) return
        const json = await res.json().catch(() => null)
        const next = !!json?.user?.private
        if (alive) setIsPrivate(next)
      } catch {}
    }

    loadPrivacy()
    return () => {
      alive = false
    }
  }, [])

  const displayUnreadCount =
    sessionNewIds.size > 0 ? sessionNewIds.size : unreadCount

  const unreadIds = useMemo(
    () => items.filter((it) => !it.read).map((it) => it._id),
    [items]
  )

  useEffect(() => {
    if (!unreadIds.length) return

    const nextIds = unreadIds.filter((id) => !sessionNewIds.has(id))
    if (!nextIds.length) return

    setSessionNewIds((prev) => {
      const next = new Set(prev)
      nextIds.forEach((id) => next.add(id))
      return next
    })

    // Mark as read for the next visit, but keep the "new" badge this session.
    markRead(nextIds)
  }, [markRead, sessionNewIds, unreadIds])

  return (
    <main className="pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto border-x border-(--dk-ink)/10 bg-(--dk-paper) min-h-screen">
        <div className="sticky top-0 bg-(--dk-paper)/95 backdrop-blur-md z-20">
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
              <div className="text-sm font-semibold text-(--dk-ink)">
                Notifications
              </div>
              <div className="text-xs text-(--dk-slate)">
                {displayUnreadCount
                  ? `${displayUnreadCount} unread`
                  : "All caught up"} • {totalCount} total
              </div>
            </div>

            {isPrivate ? (
              <button
                type="button"
                onClick={() => router.push("/settings/follow-requests")}
                className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium bg-(--dk-sky)/15 text-(--dk-ink) hover:bg-(--dk-sky)/25 transition"
              >
                <UserPlus size={14} />
                Follow requests
              </button>
            ) : null}
          </div>
        </div>

        <NotificationsList
          items={items}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          error={error}
          onLoadMore={loadMore}
          onRetry={reload}
          sessionNewIds={sessionNewIds}
        />
      </div>
    </main>
  )
}
