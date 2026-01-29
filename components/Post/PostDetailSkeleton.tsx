"use client"

export default function PostDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-sm bg-(--dk-mist)" />
            <div className="min-w-0 space-y-2">
              <div className="h-4 w-40 rounded bg-(--dk-mist)" />
              <div className="h-3 w-24 rounded bg-(--dk-mist)" />
            </div>
          </div>
          <div className="h-8 w-8 rounded-lg bg-(--dk-mist)" />
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="mt-3 space-y-2">
          <div className="h-4 w-3/4 rounded bg-(--dk-mist)" />
          <div className="h-4 w-1/2 rounded bg-(--dk-mist)" />
        </div>

        <div className="mt-4 h-52 rounded-2xl bg-(--dk-mist)" />

        <div className="mt-4 pt-3 border-t border-(--dk-ink)/10 flex items-center gap-6">
          <div className="h-4 w-10 rounded bg-(--dk-mist)" />
          <div className="h-4 w-10 rounded bg-(--dk-mist)" />
        </div>
      </div>
    </div>
  )
}
