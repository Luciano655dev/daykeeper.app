"use client"

export default function FeedTimelineSkeleton() {
  return (
    <div className="space-y-7 px-4 py-7 sm:px-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="mb-4 flex items-start gap-3">
            <div className="h-11 w-11 rounded-sm bg-(--dk-mist)" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-40 bg-(--dk-mist) rounded" />
              <div className="h-3 w-28 bg-(--dk-mist) rounded" />
            </div>
          </div>

          <div className="ml-7 space-y-2">
            <div className="h-20 rounded-lg bg-(--dk-mist)" />
            <div className="h-20 rounded-lg bg-(--dk-mist)" />
          </div>
        </div>
      ))}
    </div>
  )
}
