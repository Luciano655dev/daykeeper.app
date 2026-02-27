"use client"

export default function SearchResultsSkeleton({
  rows = 6,
}: {
  rows?: number
}) {
  return (
    <div className="animate-pulse space-y-2 px-4 py-6 sm:px-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-lg bg-(--dk-mist)/25 p-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-sm bg-(--dk-mist)" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-44 rounded bg-(--dk-mist)" />
              <div className="h-3 w-64 rounded bg-(--dk-mist)" />
            </div>
            <div className="h-14 w-14 rounded-lg bg-(--dk-mist)" />
          </div>
        </div>
      ))}
    </div>
  )
}
