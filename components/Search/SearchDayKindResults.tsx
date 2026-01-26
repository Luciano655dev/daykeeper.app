// =====================================
// FILE: components/search/SearchDayKindResults.tsx
// UPDATED: now uses SearchDayKindRow (each item shows user header)
// =====================================
"use client"

import { useMemo, useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import ActionPill from "@/components/common/ActionPill"
import SearchDayKindRow from "@/components/Search/SearchDayKindRow"

export default function SearchDayKindResults({
  type,
  items,
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  type: "Note" | "Event" | "Task"
  items: any[]
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}) {
  const list = useMemo(() => (Array.isArray(items) ? items : []), [items])

  const PREVIEW_COUNT = 8
  const [collapsed, setCollapsed] = useState(false)

  const visible = collapsed ? list.slice(0, PREVIEW_COUNT) : list
  const canCollapse = list.length > PREVIEW_COUNT && !collapsed
  const canExpand = list.length > PREVIEW_COUNT && collapsed

  // mutual exclusion
  const showLoadMore = !!hasMore
  const showShowAll = !showLoadMore && canExpand

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

      <div className="space-y-2">
        {visible.map((it: any) => (
          <SearchDayKindRow key={String(it?._id)} type={type} item={it} />
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
          <ChevronDown size={16} />
          {loadingMore ? "Loading…" : "Show more"}
        </ActionPill>
      ) : null}
    </div>
  )
}
