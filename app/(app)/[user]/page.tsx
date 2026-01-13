"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { apiFetch } from "@/lib/authClient"
import ProfileHeader from "@/components/User/UserHeader"
import UserPosts from "@/components/User/UserPosts"
import { API_URL } from "@/config"

type ApiUser = {
  _id: string
  username: string
  email?: string
  bio?: string
  private?: boolean
  profile_picture?: { url?: string }
  created_at?: string
  timeZone?: string
  maxStreak?: number
  currentStreak?: number
  followers?: number
  following?: number
  isFollowing?: boolean
  roles?: string[]
}

function normalizeUsername(param: unknown) {
  const raw = Array.isArray(param) ? param[0] : param
  if (typeof raw !== "string") return null
  const clean = raw.replace(/^@/, "").trim()
  return clean.length ? clean : null
}

export default function UserPage() {
  const params = useParams()
  const router = useRouter()

  const username: any = useMemo(
    () => normalizeUsername((params as any)?.user),
    [params]
  )

  const [user, setUser] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return

    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const res = await apiFetch(
          `${API_URL}/${encodeURIComponent(username)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        )

        const json = await res.json().catch(() => null)

        if (!res.ok) {
          if (!cancelled) setError(json?.message || "User not found")
          return
        }

        if (!cancelled) setUser(json?.data ?? null)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load user")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [username])

  if (!username) return notFound()
  if (!loading && (error || !user)) return notFound()

  return (
    <main className="pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto border-x border-(--dk-ink)/10 bg-(--dk-paper) min-h-screen">
        {/* Twitter-like top bar */}
        <div className="sticky top-0 bg-(--dk-paper)/95 backdrop-blur-md z-100">
          <div className="h-1 w-full bg-(--dk-sky)/70" />
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-(--dk-mist) transition"
              aria-label="Back"
            >
              <ArrowLeft size={18} className="text-(--dk-ink)" />
            </button>

            <div className="leading-tight min-w-0">
              <div className="text-sm font-semibold text-(--dk-ink) truncate">
                @{username}
              </div>
              <div className="text-xs text-(--dk-slate)">Profile</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm text-(--dk-slate)">
            Loading profile…
          </div>
        ) : null}

        {!loading && user ? (
          <>
            <ProfileHeader user={user} />

            <div className="h-px bg-(--dk-ink)/10" />

            {/* placeholder for tabs / user content */}
            <UserPosts username={user?.username} />
          </>
        ) : null}
      </div>
    </main>
  )
}
