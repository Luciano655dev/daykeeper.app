"use client"

export default function SearchResultsSkeleton({
  rows = 6,
}: {
  rows?: number
}) {
  return (
    <div className="px-4 py-6 space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-(--dk-ink)/10 bg-(--dk-paper) p-3"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-(--dk-mist)" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-44 rounded bg-(--dk-mist)" />
              <div className="h-3 w-64 rounded bg-(--dk-mist)" />
            </div>
            <div className="h-14 w-14 rounded-xl bg-(--dk-mist)" />
          </div>
        </div>
      ))}
    </div>
  )
}
