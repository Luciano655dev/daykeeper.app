"use client"

import { useMemo, useState } from "react"
import {
  CheckSquare2,
  Square,
  Clock,
  ClipboardList,
  Loader2,
  ChevronUp,
} from "lucide-react"
import UserDayListRow from "./UserDayListRow"
import PrivacyChip from "@/components/common/PrivacyChip"
import ActionPill from "../common/ActionPill"
import type { PaginationMeta } from "@/hooks/useUserDay"

function formatTime(s?: string) {
  if (!s) return ""
  const d = new Date(s)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function TaskStatusPill({ done }: { done: boolean }) {
  const Icon = done ? CheckSquare2 : Square

  return (
    <div
      className={[
        "inline-flex items-center justify-center",
        "h-9 w-9 rounded-xl border",
        "transition",
        done
          ? "bg-(--dk-sky)/10 border-(--dk-sky)/25 text-(--dk-sky)"
          : "bg-(--dk-paper)/60 border-(--dk-ink)/10 text-(--dk-slate) hover:bg-(--dk-mist)/60",
      ].join(" ")}
      aria-label={done ? "Task completed" : "Task not completed"}
      title={done ? "Completed" : "Not completed"}
    >
      <Icon size={18} />
    </div>
  )
}

export default function UserDayTasks({
  tasks,
  pagination,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: {
  tasks?: any[]
  pagination?: PaginationMeta
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}) {
  const PREVIEW_COUNT = 5

  const list = useMemo(() => (Array.isArray(tasks) ? tasks : []), [tasks])

  // UI-only collapse state (MUST be before any return)
  const [collapsed, setCollapsed] = useState(true)

  if (!list.length) {
    return <div className="text-sm text-(--dk-slate)">No tasks.</div>
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
        {visible.map((t: any) => {
          const done = !!t.completed
          return (
            <UserDayListRow
              key={t._id}
              showLane
              leftIcon={<ClipboardList size={22} />}
              metaTop={
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} />
                    {formatTime(t.dateLocal || t.date)}
                  </span>
                  <PrivacyChip privacy={t.privacy} />
                </span>
              }
              title={
                <span
                  className={[
                    done ? "opacity-80 line-through" : "",
                    "transition",
                  ].join(" ")}
                >
                  {t.title}
                </span>
              }
              right={<TaskStatusPill done={done} />}
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
