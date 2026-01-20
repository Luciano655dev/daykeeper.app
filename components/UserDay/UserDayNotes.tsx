"use client"

import { useMemo, useState } from "react"
import { StickyNote, Clock, Loader2, ChevronUp } from "lucide-react"
import UserDayListRow from "./UserDayListRow"
import PrivacyChip from "@/components/common/PrivacyChip"
import ActionPill from "../common/ActionPill"
import type { PaginationMeta } from "@/hooks/useUserDay"

function formatTime(s?: string) {
  if (!s) return ""
  const d = new Date(s)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function UserDayNotes({
  notes,
  pagination,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: {
  notes?: any[]
  pagination?: PaginationMeta
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}) {
  const PREVIEW_COUNT = 5

  const list = useMemo(() => (Array.isArray(notes) ? notes : []), [notes])

  // UI-only collapse state (MUST be before any return)
  const [collapsed, setCollapsed] = useState(true)

  if (!list.length) {
    return <div className="text-sm text-(--dk-slate)">No notes.</div>
  }

  const visible = collapsed ? list.slice(0, PREVIEW_COUNT) : list

  const totalCount = pagination?.totalCount ?? list.length
  const remaining = Math.max(0, totalCount - list.length)

  const canCollapse = list.length > PREVIEW_COUNT && !collapsed

  return (
    <div className="space-y-2">
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
        {visible.map((n: any) => (
          <UserDayListRow
            key={n._id}
            leftIcon={<StickyNote size={18} />}
            title={<span className="whitespace-pre-wrap">{n.text}</span>}
            metaTop={
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={12} />
                  {formatTime(n.dateLocal || n.date)}
                </span>
                <PrivacyChip privacy={n.privacy} />
              </span>
            }
          />
        ))}
      </div>

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
