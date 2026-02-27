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
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <select
        value={order}
        onChange={(e) => onOrderChange(e.target.value as SearchOrder)}
        className="rounded-lg bg-(--dk-paper)/70 px-3 py-2 text-sm text-(--dk-ink) outline-none hover:bg-(--dk-sky)/14 focus:bg-(--dk-sky)/14"
      >
        <option value="recent">Most recent</option>
        <option value="relevant">Most relevant</option>
      </select>

      <select
        value={following || "default"}
        onChange={(e) => {
          const v = e.target.value as any
          onFollowingChange(v === "default" ? undefined : (v as FollowingScope))
        }}
        className="rounded-lg bg-(--dk-paper)/70 px-3 py-2 text-sm text-(--dk-ink) outline-none hover:bg-(--dk-sky)/14 focus:bg-(--dk-sky)/14"
      >
        <option value="default">All users</option>
        <option value="friends">Friends</option>
        <option value="following">Following</option>
        <option value="followers">Followers</option>
      </select>
    </div>
  )
}
