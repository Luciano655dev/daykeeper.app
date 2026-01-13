"use client"

import { useMemo } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useUserDay } from "@/hooks/useUserDay"

import UserDayTopBarControls, {
  toDDMMYYYY,
} from "@/components/UserDay/UserDayTopBar"
import UserDayHeader from "@/components/UserDay/UserDayHeader"
import UserDayStatsBar from "@/components/UserDay/UserDayStats"
import UserDaySection from "@/components/UserDay/UserDaySection"
import UserDayTasks from "@/components/UserDay/UserDayTasks"
import UserDayNotes from "@/components/UserDay/UserDayNotes"
import UserDayEvents from "@/components/UserDay/UserDayEvents"
import UserDayPosts from "@/components/UserDay/UserDayPosts"

export default function UserDayPage() {
  const { username } = useParams<{ username: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()

  const todayParam = useMemo(() => toDDMMYYYY(new Date()), [])

  const dateParam = useMemo(() => {
    const qp = searchParams.get("date")
    return qp && qp.includes("-") ? qp : todayParam
  }, [searchParams, todayParam])

  const { loading, error, day, posts } = useUserDay(String(username), dateParam)

  return (
    <main className="pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto border-x border-(--dk-ink)/10 bg-(--dk-paper) min-h-screen">
        <div className="sticky top-0 bg-(--dk-paper)/95 backdrop-blur-md">
          <div className="h-1 w-full bg-(--dk-sky)/70" />

          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-(--dk-mist) transition"
                aria-label="Back"
              >
                <ArrowLeft size={18} className="text-(--dk-ink)" />
              </button>

              <div className="leading-tight">
                <div className="text-sm font-semibold text-(--dk-ink)">Day</div>
                <div className="text-xs text-(--dk-slate)">
                  @{String(username)}
                </div>
              </div>
            </div>

            <UserDayTopBarControls
              username={String(username)}
              dateParam={dateParam}
            />
          </div>
        </div>

        {loading && (
          <div className="px-4 py-6 text-sm text-(--dk-slate)">Loading…</div>
        )}

        {!loading && error && (
          <div className="px-4 py-6 text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && day && (
          <>
            <UserDayHeader user={day.user} nameFallback={String(username)} />

            <UserDayStatsBar
              stats={day.stats}
              entriesCount={posts?.length ?? 0}
            />

            <UserDaySection title="Tasks" count={day.tasks?.length || 0}>
              <UserDayTasks tasks={day.tasks} />
            </UserDaySection>

            <UserDaySection title="Notes" count={day.notes?.length || 0}>
              <UserDayNotes notes={day.notes} />
            </UserDaySection>

            <UserDaySection title="Events" count={day.events?.length || 0}>
              <UserDayEvents events={day.events} />
            </UserDaySection>

            <UserDaySection title="Posts" count={posts?.length || 0}>
              <UserDayPosts posts={posts} />
            </UserDaySection>
          </>
        )}
      </div>
    </main>
  )
}
