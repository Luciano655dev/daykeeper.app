// =====================================
// FILE: components/search/SearchResultsSwitch.tsx
// UPDATED: pass narrowed union to SearchDayKindResults
// =====================================
"use client"

import type { SearchType } from "@/hooks/useSearch"
import SearchPostResultCard from "@/components/Search/SearchPostResultCard"
import SearchUserResultRow from "@/components/Search/SearchUserResultRow"
import SearchDayKindResults from "@/components/Search/SearchDayKindResults"

export default function SearchResultsSwitch({
  type,
  items,
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  type: SearchType
  items: any[]
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}) {
  if (type === "Post") {
    return (
      <div className="px-4 pb-6 space-y-2">
        {items.map((p: any) => (
          <SearchPostResultCard key={String(p?._id || p?.id)} post={p} />
        ))}
      </div>
    )
  }

  if (type === "User") {
    return (
      <div className="px-4 pb-6 space-y-2">
        {items.map((u: any) => (
          <SearchUserResultRow key={String(u?._id)} user={u} />
        ))}
      </div>
    )
  }

  if (type === "Note" || type === "Event" || type === "Task") {
    return (
      <div className="px-4 pb-6">
        <SearchDayKindResults
          type={type}
          items={items}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={onLoadMore}
        />
      </div>
    )
  }

  return null
}
