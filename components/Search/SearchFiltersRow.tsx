"use client"

import type { FollowingScope, SearchOrder } from "@/hooks/useSearch"

export default function SearchFiltersRow({
  order,
  onOrderChange,
  following,
  onFollowingChange,
}: {
  order: SearchOrder
  onOrderChange: (v: SearchOrder) => void
  following?: FollowingScope
  onFollowingChange: (v?: FollowingScope) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={order}
        onChange={(e) => onOrderChange(e.target.value as SearchOrder)}
        className="rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper) px-3 py-2 text-sm text-(--dk-ink) outline-none"
      >
        <option value="recent">recent</option>
        <option value="relevant">relevant</option>
      </select>

      <select
        value={following || "default"}
        onChange={(e) => {
          const v = e.target.value as any
          onFollowingChange(v === "default" ? undefined : (v as FollowingScope))
        }}
        className="rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper) px-3 py-2 text-sm text-(--dk-ink) outline-none"
      >
        <option value="default">all</option>
        <option value="friends">friends</option>
        <option value="following">following</option>
        <option value="followers">followers</option>
      </select>
    </div>
  )
}
