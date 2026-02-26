"use client"

import { Search, Bell, Plus, CalendarDays, FileText, CheckSquare2, EyeOff } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/hooks/useNotifications"

export default function RightPanel() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const debounceRef = useRef<any>(null)
  const { items, loading, unreadCount } = useNotifications()

  const topNotifications = useMemo(() => items.slice(0, 3), [items])
  const newNotifications = useMemo(
    () => items.filter((n) => !n.read).slice(0, 3),
    [items]
  )
  const todayParam = useMemo(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }, [])
  const [hideNotifications, setHideNotifications] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dk-hide-notifications")
      if (raw === "1") setHideNotifications(true)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("dk-hide-notifications", hideNotifications ? "1" : "0")
    } catch {}
  }, [hideNotifications])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    if (!q) return
    debounceRef.current = setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, router])

  return (
    <aside className="hidden lg:block fixed right-0 top-0 h-screen w-80 p-4 overflow-y-auto bg-(--dk-paper)">
      <div className="space-y-4">
        {/* Search */}
        <div className="bg-(--dk-mist) rounded-xl p-3 flex items-center gap-3 border border-(--dk-ink)/10">
          <Search size={18} className="text-(--dk-sky)" />
          <input
            type="text"
            placeholder="Search Daykeeper"
            className="bg-transparent outline-none text-sm text-(--dk-ink) placeholder:text-(--dk-slate) flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return
              const q = query.trim()
              if (!q) return
              router.push(`/search?q=${encodeURIComponent(q)}`)
            }}
          />
        </div>

        {/* Quick create */}
        <div className="bg-(--dk-paper) rounded-2xl border border-(--dk-ink)/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-(--dk-ink)/10">
            <h2 className="font-bold text-(--dk-ink) text-lg">Quick create</h2>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3">
            <button
              onClick={() => router.push("/post/create")}
              className="flex items-center gap-2 rounded-xl border border-(--dk-ink)/10 px-3 py-2 text-sm text-(--dk-ink) hover:bg-(--dk-mist) transition"
            >
              <Plus size={16} className="text-(--dk-sky)" />
              Post
            </button>
            <button
              onClick={() => router.push(`/day/events/create?date=${todayParam}`)}
              className="flex items-center gap-2 rounded-xl border border-(--dk-ink)/10 px-3 py-2 text-sm text-(--dk-ink) hover:bg-(--dk-mist) transition"
            >
              <CalendarDays size={16} className="text-(--dk-sky)" />
              Event
            </button>
            <button
              onClick={() => router.push(`/day/notes/create?date=${todayParam}`)}
              className="flex items-center gap-2 rounded-xl border border-(--dk-ink)/10 px-3 py-2 text-sm text-(--dk-ink) hover:bg-(--dk-mist) transition"
            >
              <FileText size={16} className="text-(--dk-sky)" />
              Note
            </button>
            <button
              onClick={() => router.push(`/day/tasks/create?date=${todayParam}`)}
              className="flex items-center gap-2 rounded-xl border border-(--dk-ink)/10 px-3 py-2 text-sm text-(--dk-ink) hover:bg-(--dk-mist) transition"
            >
              <CheckSquare2 size={16} className="text-(--dk-sky)" />
              Task
            </button>
          </div>
        </div>

        {/* New notifications */}
        {!hideNotifications && unreadCount > 0 ? (
          <div className="bg-(--dk-paper) rounded-2xl border border-(--dk-ink)/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-(--dk-ink)/10 flex items-center justify-between">
              <h2 className="font-bold text-(--dk-ink) text-lg">New</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/notifications")}
                  className="text-xs text-(--dk-sky) hover:text-(--dk-ink) transition"
                >
                  View all
                </button>
                <button
                  type="button"
                  onClick={() => setHideNotifications(true)}
                  className="p-1 rounded-md text-(--dk-slate) hover:text-(--dk-ink) hover:bg-(--dk-mist) transition"
                  aria-label="Hide notifications"
                >
                  <EyeOff size={14} />
                </button>
              </div>
            </div>

            <div className="divide-y divide-(--dk-ink)/10">
              {newNotifications.map((n) => (
                <div key={n._id} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-(--dk-sky)" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-(--dk-ink) truncate">
                        {n.title || "Notification"}
                      </div>
                      {n.body ? (
                        <div className="text-xs text-(--dk-slate) line-clamp-2">
                          {n.body}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Recent notifications */}
        {!hideNotifications ? (
          <div className="bg-(--dk-paper) rounded-2xl border border-(--dk-ink)/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-(--dk-ink)/10 flex items-center justify-between">
              <h2 className="font-bold text-(--dk-ink) text-lg">
                Notifications
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/notifications")}
                  className="text-xs text-(--dk-sky) hover:text-(--dk-ink) transition"
                >
                  View all
                </button>
                <button
                  type="button"
                  onClick={() => setHideNotifications(true)}
                  className="p-1 rounded-md text-(--dk-slate) hover:text-(--dk-ink) hover:bg-(--dk-mist) transition"
                  aria-label="Hide notifications"
                >
                  <EyeOff size={14} />
                </button>
              </div>
            </div>

          {loading ? (
            <div className="px-4 py-4 text-sm text-(--dk-slate)">
              Loading notifications...
            </div>
          ) : topNotifications.length === 0 ? (
            <div className="px-4 py-4 text-sm text-(--dk-slate)">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-(--dk-ink)/10">
              {topNotifications.map((n) => (
                <div key={n._id} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Bell
                      size={16}
                      className="text-(--dk-sky) mt-0.5 shrink-0 flex-none"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-(--dk-ink) truncate">
                        {n.title || "Notification"}
                      </div>
                      {n.body ? (
                        <div className="text-xs text-(--dk-slate) line-clamp-2">
                          {n.body}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        ) : (
          <button
            type="button"
            onClick={() => setHideNotifications(false)}
            className="w-full text-left rounded-2xl border border-(--dk-ink)/10 bg-(--dk-paper) px-4 py-3 text-sm text-(--dk-slate) hover:text-(--dk-ink) hover:bg-(--dk-mist) transition"
          >
            Show notifications
          </button>
        )}
      </div>
    </aside>
  )
}
