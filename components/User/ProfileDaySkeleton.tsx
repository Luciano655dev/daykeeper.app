"use client"

function SectionSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <div className="border-t border-(--dk-ink)/10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-(--dk-mist)" />
        <div className="h-7 w-7 rounded-full bg-(--dk-mist)" />
      </div>
      <div className="px-4 pb-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-(--dk-mist)" />
        ))}
      </div>
    </div>
  )
}

export default function ProfileDaySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-(--dk-ink)/10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="h-8 w-8 rounded-lg bg-(--dk-mist)" />
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="h-4 w-28 rounded bg-(--dk-mist)" />
            <div className="h-3 w-20 rounded bg-(--dk-mist)" />
          </div>
          <div className="h-8 w-8 rounded-lg bg-(--dk-mist)" />
        </div>
      </div>

      <SectionSkeleton rows={2} />
      <SectionSkeleton rows={2} />
      <SectionSkeleton rows={1} />
      <SectionSkeleton rows={2} />
    </div>
  )
}
