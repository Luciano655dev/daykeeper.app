"use client"

import { useMemo } from "react"
import { CheckSquare, Calendar, List, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { toDayParam } from "@/lib/date"

export default function FeedUserDayCard({ userDay, selectedDate }: any) {
  const router = useRouter()
  // dummy day meta (replace with API fields later)
  const dayMeta = useMemo(() => {
    const obj = {
      entries: userDay?.postsCount || 0,
      tasksUpdated: userDay?.tasksCount || 0,
      events: userDay?.eventsCount || 0,
      notes: userDay?.notesCount || 0,
      lastUpdateTime: userDay?.lastPostTime || "12:00",
    }
    return obj
  }, [userDay.posts.length])

  function openDay() {
    // you can decide your route format later
    // example: /day/2026-01-07?user=USER_ID
    router.push(`/day/2026-01-07?user=${userDay.user_info._id}`)
    router.push(
      `/day/${userDay.user_info.username}?date=${toDayParam(selectedDate)}`
    )
  }
  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={openDay}
        className="ml-8 w-[calc(100%-2rem)] text-left rounded-xl border border-(--dk-ink)/10 bg-(--dk-mist)/55 hover:bg-(--dk-mist)/75 transition px-4 py-2 cursor-pointer"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--dk-slate)">
          <span className="font-semibold tracking-wide text-(--dk-slate)">
            DAY
          </span>

          <span className="h-1 w-1 rounded-full bg-(--dk-ink)/20" />

          <span>
            <span className="font-semibold text-(--dk-ink)">
              {dayMeta.entries}
            </span>{" "}
            entries
          </span>

          <span className="h-1 w-1 rounded-full bg-(--dk-ink)/20" />

          <span className="inline-flex items-center gap-1.5">
            <CheckSquare size={14} />
            <span className="font-semibold text-(--dk-ink)">
              {dayMeta.tasksUpdated}
            </span>{" "}
            tasks
          </span>

          <span className="h-1 w-1 rounded-full bg-(--dk-ink)/20" />

          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            <span className="font-semibold text-(--dk-ink)">
              {dayMeta.events}
            </span>{" "}
            events
          </span>

          <span className="h-1 w-1 rounded-full bg-(--dk-ink)/20" />

          <span className="inline-flex items-center gap-1.5">
            <List size={14} />
            <span className="font-semibold text-(--dk-ink)">
              {dayMeta.notes}
            </span>{" "}
            notes
          </span>

          {dayMeta.lastUpdateTime ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} />
                <span className="font-semibold text-(--dk-ink)">
                  {dayMeta.lastUpdateTime}
                </span>{" "}
                pm
              </span>
            </>
          ) : null}
        </div>
      </button>
    </div>
  )
}
