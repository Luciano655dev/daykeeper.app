"use client"

export default function UserDaySection({
  title,
  count,
  action,
  children,
}: {
  title: string
  count?: number
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="px-4 py-5 sm:px-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-(--dk-ink)">{title}</div>
        <div className="flex items-center gap-2">
          {action ? action : null}
          <div className="text-xs text-(--dk-slate)">{count ?? 0}</div>
        </div>
      </div>

      <div className="mt-3">{children}</div>
    </section>
  )
}
