"use client"

import type { SearchType } from "@/hooks/useSearch"
import {
  Users,
  FileText,
  CalendarDays,
  StickyNote,
  CheckSquare,
} from "lucide-react"

function TypeIcon({ type }: { type: SearchType }) {
  if (type === "User") return <Users size={16} />
  if (type === "Post") return <FileText size={16} />
  if (type === "Event") return <CalendarDays size={16} />
  if (type === "Note") return <StickyNote size={16} />
  return <CheckSquare size={16} />
}

export default function SearchTypePills({
  value,
  onChange,
}: {
  value: SearchType
  onChange: (t: SearchType) => void
}) {
  const types: SearchType[] = ["Post", "User", "Event", "Note", "Task"]

  return (
    <div className="flex flex-wrap gap-2">
      {types.map((t) => {
        const active = t === value
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={[
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition",
              active
                ? "border-(--dk-sky)/60 bg-(--dk-sky) text-(--dk-paper)"
                : "border-(--dk-ink)/10 bg-(--dk-paper) text-(--dk-ink) hover:bg-(--dk-mist)",
            ].join(" ")}
          >
            <TypeIcon type={t} />
            {t}
          </button>
        )
      })}
    </div>
  )
}
