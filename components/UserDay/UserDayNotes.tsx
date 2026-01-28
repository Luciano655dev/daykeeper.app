"use client"

import { useMemo, useState } from "react"
import {
  StickyNote,
  Clock,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { useRouter } from "next/navigation"

import UserDayListRow from "./UserDayListRow"
import PrivacyChip from "@/components/common/PrivacyChip"
import ActionPill from "../common/ActionPill"
import type { PaginationMeta } from "@/hooks/useUserDay"
import RichText from "@/components/common/RichText"

function formatTime(s?: string) {
  if (!s) return ""
  const d = new Date(s)
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function UserDayNotes({
  notes,
  pagination,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onCollapse,
}: {
  notes?: any[]
  pagination?: PaginationMeta
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
  onCollapse?: () => void
}) {
  const router = useRouter()
  const PREVIEW_COUNT = 5

  const list = useMemo(() => (Array.isArray(notes) ? notes : []), [notes])

  // UI-only collapse state
  const [collapsed, setCollapsed] = useState(true)

  if (!list.length) {
    return <div className="text-sm text-(--dk-slate)">No notes.</div>
  }

  const visible = collapsed ? list.slice(0, PREVIEW_COUNT) : list

  const canCollapse = list.length > PREVIEW_COUNT && !collapsed
  const canExpand = list.length > PREVIEW_COUNT && collapsed
  const showLoadMore = !!hasMore && !!onLoadMore
  const showShowAll = !showLoadMore && canExpand

  return (
    <div className="space-y-2">
      {canCollapse ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setCollapsed(true)
              onCollapse?.()
            }}
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
            title={
              <span className="whitespace-pre-wrap">
                <RichText text={String(n.text || "")} />
              </span>
            }
            metaTop={
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={12} />
                  {formatTime(n.dateLocal || n.date)}
                </span>
                <PrivacyChip privacy={n.privacy} />
              </span>
            }
            onClick={() => router.push(`/day/notes/${n._id}`)}
          />
        ))}
      </div>

      {showShowAll ? (
        <ActionPill onClick={() => setCollapsed(false)}>
          <ChevronDown size={16} />
          Show all
        </ActionPill>
      ) : null}

      {showLoadMore ? (
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
            <>
              <ChevronDown size={16} />
              Show more
            </>
          )}
        </ActionPill>
      ) : null}
    </div>
  )
}
