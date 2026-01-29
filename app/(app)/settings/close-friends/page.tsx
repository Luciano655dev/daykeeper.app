"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, UserCheck, UserPlus } from "lucide-react"

import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"
import { useCloseFriends } from "@/hooks/useCloseFriends"
import FormAlert from "@/components/Form/FormAlert"
import { AVATAR_FALLBACK } from "@/components/Search/searchUtils"
import RichText from "@/components/common/RichText"

export default function CloseFriendsPage() {
  const router = useRouter()
  const {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    totalCount,
  } = useCloseFriends()

  const [busyUsername, setBusyUsername] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [removedUsernames, setRemovedUsernames] = useState<Set<string>>(
    () => new Set()
  )

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        if (hasMore && !loadingMore) loadMore()
      },
      { rootMargin: "600px" }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, loadMore])

  async function toggleCloseFriend(username?: string) {
    if (!username || busyUsername) return
    setBusyUsername(username)
    setActionError(null)

    try {
      const res = await apiFetch(`${API_URL}/close_friends/${username}`, {
        method: "POST",
      })
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || "Failed to update close friends")
      }
      const data = await res.json().catch(() => null)
      console.log("close_friends response", {
        username,
        status: res.status,
        data,
      })
      setRemovedUsernames((prev) => {
        const next = new Set(prev)
        if (next.has(username)) next.delete(username)
        else next.add(username)
        return next
      })
    } catch (e: any) {
      setActionError(e?.message || "Failed to update close friends")
    } finally {
      setBusyUsername(null)
    }
  }

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
                Close friends
              </div>
              <div className="text-xs text-(--dk-slate)">
                {totalCount} people in your close friends list
              </div>
            </div>
          </div>
        </div>

        <div className="pb-8">
          <div className="px-4 pt-6">
            {error ? <FormAlert>{error}</FormAlert> : null}
            {actionError ? <FormAlert>{actionError}</FormAlert> : null}
          </div>

          <section className="border-t border-(--dk-ink)/10">
            {loading ? (
              <div className="px-4 py-6 text-sm text-(--dk-slate)">
                Loading close friends...
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-(--dk-slate)">
                You have no close friends yet.
              </div>
            ) : (
              <div className="divide-y divide-(--dk-ink)/10">
                {items.map((friend) => {
                  const avatar =
                    friend?.profile_picture?.url || AVATAR_FALLBACK
                  const title =
                    friend?.displayName || friend?.username || "User"
                  const subtitle =
                    [friend?.username ? `@${friend.username}` : "", friend?.bio]
                      .filter(Boolean)
                      .join(" • ")
                  const isBusy = busyUsername === friend?.username
                  const username = friend?.username || ""
                  const isRemoved = removedUsernames.has(username)
                  const isInCloseFriends = !isRemoved

                  return (
                    <div key={friend._id} className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-(--dk-ink)/10 bg-(--dk-mist)">
                          <Image src={avatar} alt="" fill className="object-cover" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-(--dk-ink)">
                            {title}
                          </div>
                          <div className="mt-0.5 line-clamp-2 text-xs text-(--dk-slate)">
                            <RichText text={subtitle || "No bio yet"} />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleCloseFriend(username)}
                          disabled={isBusy}
                          className={[
                            "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition",
                            isInCloseFriends
                              ? "bg-(--dk-mist) text-(--dk-ink) hover:bg-(--dk-mist)/70"
                              : "bg-(--dk-sky) text-white hover:brightness-95",
                            isBusy ? "opacity-60" : "",
                          ].join(" ")}
                        >
                          {isInCloseFriends ? (
                            <UserCheck size={14} />
                          ) : (
                            <UserPlus size={14} />
                          )}
                          {isBusy
                            ? "Saving..."
                            : isInCloseFriends
                              ? "Remove"
                              : "Add"}
                        </button>
                      </div>
                    </div>
                  )
                })}

                {loadingMore ? (
                  <div className="px-4 py-4 text-sm text-(--dk-slate)">
                    Loading more...
                  </div>
                ) : null}
              </div>
            )}
          </section>

          {!loading && !loadingMore && !hasMore && items.length > 0 ? (
            <div className="text-xs text-(--dk-slate) text-center pt-6">
              You’re all caught up.
            </div>
          ) : null}

          <div ref={sentinelRef} className="h-1" />
        </div>
      </div>
    </main>
  )
}
