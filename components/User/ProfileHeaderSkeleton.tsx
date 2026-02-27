"use client"

export default function ProfileHeaderSkeleton() {
  return (
    <div className="animate-pulse px-4 pt-5 pb-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="h-16 w-16 rounded-sm bg-(--dk-mist)" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-48 rounded bg-(--dk-mist)" />
            <div className="h-4 w-24 rounded bg-(--dk-mist)" />
          </div>
        </div>

        <div className="sm:ml-auto flex items-center gap-2">
          <div className="h-9 w-28 rounded-xl bg-(--dk-mist)" />
          <div className="h-10 w-10 rounded-xl bg-(--dk-mist)" />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="h-4 w-72 rounded bg-(--dk-mist)" />
        <div className="h-4 w-52 rounded bg-(--dk-mist)" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-5 w-24 rounded bg-(--dk-mist)" />
        ))}
      </div>
    </div>
  )
}
