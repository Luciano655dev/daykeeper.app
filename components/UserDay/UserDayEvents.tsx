"use client"

import { useMemo, useState } from "react"
import {
  CalendarDays,
  ArrowRight,
  Clock,
  Loader2,
  ChevronUp,
} from "lucide-react"
import UserDayListRow from "./UserDayListRow"
import PrivacyChip from "@/components/common/PrivacyChip"
import ActionPill from "../common/ActionPill"
import type { PaginationMeta } from "@/hooks/useUserDay"
import { useRouter } from "next/navigation"

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function weekKey(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const day = x.getDay()
  x.setDate(x.getDate() - day)
  return x.toISOString().slice(0, 10)
}

function formatShortWeekdayTime(d: Date) {
  const weekday = d.toLocaleDateString([], { weekday: "short" })
  const hh = pad2(d.getHours())
  const mm = pad2(d.getMinutes())
  return `${weekday} ${hh}:${mm}`
}

function formatFullDDMMYYYYTime(d: Date) {
  const dd = pad2(d.getDate())
  const mm = pad2(d.getMonth() + 1)
  const yyyy = d.getFullYear()
  const hh = pad2(d.getHours())
  const min = pad2(d.getMinutes())
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

function formatEventTimeRange(startISO?: string, endISO?: string) {
  const start = startISO ? new Date(startISO) : null
  const end = endISO ? new Date(endISO) : null

  if (!start) return { startText: "", endText: "" }

  const crossesWeek = !!end && weekKey(start) !== weekKey(end)
  const fmt = crossesWeek ? formatFullDDMMYYYYTime : formatShortWeekdayTime

  return { startText: fmt(start), endText: end ? fmt(end) : "" }
}

function formatCreatedTime(iso?: string) {
  if (!iso) return ""
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function UserDayEvents({
  events,
  pagination,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: {
  events?: any[]
  pagination?: PaginationMeta
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}) {
  const PREVIEW_COUNT = 5

  const router = useRouter()
  const list = useMemo(() => (Array.isArray(events) ? events : []), [events])

  // UI-only collapse state (MUST be before any return)
  const [collapsed, setCollapsed] = useState(true)

  if (!list.length) {
    return <div className="text-sm text-(--dk-slate)">No events.</div>
  }

  const visible = collapsed ? list.slice(0, PREVIEW_COUNT) : list

  const totalCount = pagination?.totalCount ?? list.length
  const remaining = Math.max(0, totalCount - list.length)

  const canCollapse = list.length > PREVIEW_COUNT && !collapsed

  return (
    <div className="space-y-2">
      {/* collapse (UI-only). shows after you've expanded / have enough items */}
      {canCollapse ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-(--dk-slate) hover:underline"
          >
            <ChevronUp size={14} />
            Collapse
          </button>
        </div>
      ) : null}

      <div className="space-y-1">
        {visible.map((ev: any) => {
          const { startText, endText } = formatEventTimeRange(
            ev.dateStartLocal || ev.dateStart,
            ev.dateEndLocal || ev.dateEnd,
          )

          const createdISO =
            ev.created_at || ev.createdAt || ev.dateCreated || ev.date

          return (
            <UserDayListRow
              key={ev._id}
              leftIcon={<CalendarDays size={18} />}
              title={ev.title}
              onClick={() => router.push(`/day/events/${ev._id}`)}
              metaTop={
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-xs text-(--dk-slate) shrink-0">
                    <Clock size={12} />
                    {formatCreatedTime(createdISO)}
                  </span>
                  <div className="shrink-0">
                    <PrivacyChip privacy={ev.privacy} />
                  </div>
                </div>
              }
              right={
                <div className="flex items-center justify-end min-w-0 max-w-full">
                  <div
                    className={[
                      "inline-flex items-center gap-2",
                      "rounded-xl border border-(--dk-ink)/10 bg-(--dk-mist)/35",
                      "px-2.5 py-1 text-xs",
                      "max-w-full min-w-0",
                      "flex-wrap sm:flex-nowrap",
                    ].join(" ")}
                  >
                    <span className="font-semibold text-(--dk-ink) whitespace-nowrap">
                      {startText}
                    </span>

                    {endText ? (
                      <>
                        <ArrowRight
                          size={12}
                          className="text-(--dk-slate)/70 shrink-0"
                        />
                        <span className="font-semibold text-(--dk-ink) whitespace-nowrap">
                          {endText}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              }
            />
          )
        })}
      </div>

      {/* load more (same label). Clicking load more should auto-expand */}
      {hasMore && onLoadMore ? (
        <ActionPill
          onClick={() => {
            if (loadingMore) return
            setCollapsed(false)
            onLoadMore()
          }}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Loading…
            </>
          ) : (
            <>Load more{remaining ? ` (${remaining})` : ""}</>
          )}
        </ActionPill>
      ) : null}
    </div>
  )
}
