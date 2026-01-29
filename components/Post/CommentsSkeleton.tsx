"use client"

export default function CommentsSkeleton() {
  return (
    <section className="border-t border-(--dk-ink)/10 animate-pulse">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="h-4 w-20 rounded bg-(--dk-mist)" />
      </div>

      <div className="px-4 pb-4 space-y-3">
        <div className="h-20 rounded-xl bg-(--dk-mist)" />
        <div className="flex items-center justify-end gap-2">
          <div className="h-3 w-10 rounded bg-(--dk-mist)" />
          <div className="h-7 w-14 rounded-xl bg-(--dk-mist)" />
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-md bg-(--dk-mist)" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-(--dk-mist)" />
              <div className="h-4 w-3/4 rounded bg-(--dk-mist)" />
              <div className="h-3 w-24 rounded bg-(--dk-mist)" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
