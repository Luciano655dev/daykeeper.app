"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import type { TimeZoneOption } from "@/lib/types/edit_profile"

export default function TimeZonePicker({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: TimeZoneOption[]
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const selected = useMemo(
    () => options.find((o) => o.value === value) || null,
    [options, value]
  )

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return options
    return options.filter((o) => {
      const hay = `${o.label} ${o.value} ${o.keywords || ""}`.toLowerCase()
      return hay.includes(s)
    })
  }, [options, q])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "h-11 w-full rounded-lg border border-transparent bg-(--dk-mist)/45 px-4",
          "text-sm text-(--dk-ink) flex items-center gap-3",
          "outline-none transition",
          open ? "border-(--dk-sky)/35 bg-(--dk-paper)" : "",
        ].join(" ")}
      >
        <span className="text-base leading-none">{selected?.flag || "🌐"}</span>
        <span className={selected ? "truncate" : "truncate text-(--dk-slate)"}>
          {selected ? selected.label : "Select a time zone"}
        </span>

        <span className="ml-auto text-(--dk-ink)/40">
          <ChevronDown size={18} />
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper)">
          <div className="p-2 border-b border-(--dk-ink)/10">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search time zones..."
                className="h-10 w-full rounded-lg border border-transparent bg-(--dk-mist)/45 pl-10 pr-3 text-sm text-(--dk-ink) outline-none focus:border-(--dk-sky)/35 focus:bg-(--dk-paper)"
                autoFocus
              />
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--dk-ink)/40">
                <Search size={16} />
              </div>
            </div>
          </div>

          <div className="max-h-72 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-(--dk-slate)">
                No matches.
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                    setQ("")
                  }}
                  className={[
                    "w-full px-4 py-3 text-left flex items-center gap-3",
                    "hover:bg-(--dk-mist)/40 transition",
                    opt.value === value ? "bg-(--dk-sky)/10" : "",
                  ].join(" ")}
                >
                  <span className="text-base leading-none">{opt.flag}</span>
                  <div className="min-w-0">
                    <div className="text-sm text-(--dk-ink) truncate">
                      {opt.label}
                    </div>
                    <div className="text-xs text-(--dk-slate) truncate">
                      {opt.value}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
