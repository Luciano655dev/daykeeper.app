"use client"

type Props = {
  leftIcon: React.ReactNode
  metaTop?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  right?: React.ReactNode
  showLane?: boolean
  alignTop?: boolean
  onClick?: any
}

export default function UserDayListRow({
  leftIcon,
  metaTop,
  title,
  subtitle,
  right,
  showLane = true,
  alignTop = false,
  onClick = () => {},
}: Props) {
  return (
    <div
      className="-mx-2 cursor-pointer rounded-lg px-2 py-2.5 transition hover:bg-(--dk-mist)/35"
      onClick={onClick}
    >
      <div
        className={[
          "flex gap-3",
          alignTop ? "items-start" : "items-center",
        ].join(" ")}
      >
        {/* lane marker + icon */}
        <div className="flex items-center gap-3 shrink-0">
          {showLane ? (
            <div className="h-6 w-0.5 rounded-full bg-(--dk-sky)/45" />
          ) : null}

          <div className="flex items-center text-(--dk-sky)">{leftIcon}</div>
        </div>

        {/* content (vertically centered) */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          {metaTop ? (
            <div className="text-xs text-(--dk-slate) leading-tight">
              {metaTop}
            </div>
          ) : null}

          <div className="truncate text-sm font-medium leading-snug text-(--dk-ink)">
            {title}
          </div>

          {subtitle ? (
            <div className="text-sm text-(--dk-slate) line-clamp-2 leading-snug">
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* right */}
        {right ? (
          <div className="shrink-0 flex items-center">{right}</div>
        ) : null}
      </div>
    </div>
  )
}
