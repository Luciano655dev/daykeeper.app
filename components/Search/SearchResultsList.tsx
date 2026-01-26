"use client"

import { useEffect, useRef } from "react"
import type { SearchType } from "@/hooks/useSearch"
import SearchResultsSwitch from "@/components/Search/SearchResultsSwitch"

export default function SearchResultsList({
  items,
  type,
  loadingMore,
  hasMore,
  onLoadMore,
}: {
  items: any[]
  type: SearchType
  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        if (hasMore && !loadingMore) onLoadMore()
      },
      { rootMargin: "700px" },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, onLoadMore])

  return (
    <>
      <SearchResultsSwitch
        type={type}
        items={items}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={onLoadMore}
      />

      {loadingMore ? (
        <div className="px-4 pb-6 text-center text-sm text-(--dk-slate)">
          Loading more…
        </div>
      ) : null}

      {!hasMore && items.length ? (
        <div className="px-4 pb-6 text-center text-xs text-(--dk-slate)">
          End of results
        </div>
      ) : null}

      <div ref={sentinelRef} />
    </>
  )
}
