"use client"

import { useEffect, useRef } from "react"
import type { FeedUserDay as FeedUserDayType } from "@/lib/feedTypes"
import FeedTimelineSkeleton from "./FeedTimelineSkeleton"
import FeedTimelineEmpty from "./FeedTimelineEmpty"
import FeedUserDay from "./FeedUserDay"
import { useDelayedRender } from "@/hooks/useDelayedRender"
import FeedTimelineEnd from "./FeedTimelineEnd"

type Props = {
  data: FeedUserDayType[]
  loading: boolean
  selectedDate: any

  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void

  error?: string | null
  onRetry?: () => void
}

export default function FeedTimeline({
  data,
  selectedDate,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  error,
  onRetry,
}: Props) {
  const LANE_X = "2rem"
  const LANE_RIGHT = "1rem"

  const readyToShowSkeleton = useDelayedRender(200)
  const showSkeleton = loading && readyToShowSkeleton

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    if (!hasMore) return
    if (loading || loadingMore) return

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore()
      },
      { root: null, rootMargin: "400px", threshold: 0 }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loading, loadingMore, onLoadMore])

  return (
    <div
      className="relative"
      style={{
        ["--lane-x" as any]: LANE_X,
        ["--lane-right" as any]: LANE_RIGHT,
      }}
    >
      <div
        className="absolute top-0 bottom-0 w-px bg-(--dk-sky)/45"
        style={{ left: "var(--lane-x)" }}
      />

      {showSkeleton && <FeedTimelineSkeleton />}

      {!loading && data.length > 0 && (
        <div className="space-y-8 py-6">
          {data.map((userDay) => (
            <FeedUserDay
              key={userDay.userId}
              userDay={userDay}
              selectedDate={selectedDate}
            />
          ))}

          <div className="pt-2">
            {error && onRetry ? (
              <button
                onClick={onRetry}
                className="text-xs underline text-(--dk-slate) hover:text-(--dk-ink)"
              >
                Failed to load more. Click to retry.
              </button>
            ) : loadingMore ? (
              <p className="text-xs text-(--dk-slate)">Loading more…</p>
            ) : !hasMore && data.length > 0 ? (
              <FeedTimelineEnd />
            ) : null}
          </div>

          <div ref={sentinelRef} className="h-1" />
        </div>
      )}

      {!loading && data.length === 0 && <FeedTimelineEmpty />}
    </div>
  )
}
