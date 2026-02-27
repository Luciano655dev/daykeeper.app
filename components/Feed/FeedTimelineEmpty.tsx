"use client"

import { Clock } from "lucide-react"

export default function FeedTimelineEmpty() {
  return (
    <div className="px-4 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-(--dk-mist)">
        <Clock size={32} className="text-(--dk-sky)" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-(--dk-ink)">
        No posts for this day
      </h3>
      <p className="text-sm text-(--dk-slate)">
        Check out another day or create your first post!
      </p>
    </div>
  )
}
