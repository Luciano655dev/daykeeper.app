"use client"

import { useMemo } from "react"
import { useParams, useRouter, notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import ProfileHeader from "@/components/User/UserHeader"
import ProfileHeaderSkeleton from "@/components/User/ProfileHeaderSkeleton"
import ProfileDaySkeleton from "@/components/User/ProfileDaySkeleton"
import ProfileDay from "@/components/User/ProfileDay"
import { useUserProfile } from "@/hooks/useUserProfile"

function normalizeUsername(param: unknown) {
  const raw = Array.isArray(param) ? param[0] : param
  if (typeof raw !== "string") return null
  const clean = raw.replace(/^@/, "").trim()
  return clean.length ? clean : null
}

export default function UserPage() {
  const params = useParams()
  const router = useRouter()

  const username = useMemo(
    () => normalizeUsername((params as any)?.user),
    [params]
  )

  if (!username) return notFound()

  const q = useUserProfile(username)

  // TanStack states
  const loading = q.isLoading
  const user = q.data
  const error = q.error

  if (!loading && (!user || error)) return notFound()

  return (
    <main className="pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto border-x border-(--dk-ink)/10 bg-(--dk-paper) min-h-screen">
        <div className="sticky top-0 bg-(--dk-paper)/95 backdrop-blur-md z-50">
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

        {loading && (
          <>
            <ProfileHeaderSkeleton />
            <div className="h-px bg-(--dk-ink)/10" />
            <ProfileDaySkeleton />
          </>
        )}

        {!loading && user && (
          <>
            <ProfileHeader user={user} />

            <div className="h-px bg-(--dk-ink)/10" />

            <ProfileDay username={user.username} />
          </>
        )}
      </div>
    </main>
  )
}
