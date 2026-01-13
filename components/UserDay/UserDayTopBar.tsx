"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

export function toDDMMYYYY(d: Date) {
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`
}

function fromDDMMYYYY(s: string) {
  const [dd, mm, yyyy] = s.split("-").map((x) => Number(x))
  if (!dd || !mm || !yyyy) return null
  const d = new Date()
  d.setFullYear(yyyy, mm - 1, dd)
  d.setHours(0, 0, 0, 0)
  return d
}

function toISODateInputValue(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function fromISOToLocalDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return null
  const dt = new Date()
  dt.setFullYear(y, m - 1, d)
  dt.setHours(0, 0, 0, 0)
  return dt
}

function addDays(ddmmyyyy: string, delta: number) {
  const d = fromDDMMYYYY(ddmmyyyy)
  if (!d) return ddmmyyyy
  d.setDate(d.getDate() + delta)
  return toDDMMYYYY(d)
}

export default function UserDayTopBarControls({
  username,
  dateParam,
}: {
  username: string
  dateParam: string
}) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  const initialDate = useMemo(() => fromDDMMYYYY(dateParam), [dateParam])
  const [draftISO, setDraftISO] = useState(() =>
    initialDate ? toISODateInputValue(initialDate) : ""
  )

  useEffect(() => {
    if (!open) return
    const d = fromDDMMYYYY(dateParam)
    setDraftISO(d ? toISODateInputValue(d) : "")
  }, [open, dateParam])

  useEffect(() => {
    if (!open) return

    const onPointerDownCapture = (e: PointerEvent) => {
      const el = popoverRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false)
    }

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("pointerdown", onPointerDownCapture, true)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("pointerdown", onPointerDownCapture, true)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open])

  function setDate(next: string) {
    // NO CLAMP: allow past today / future days
    router.push(
      `/day/${encodeURIComponent(username)}?date=${encodeURIComponent(next)}`
    )
  }

  function commitDraft(iso: string) {
    const d = fromISOToLocalDate(iso)
    if (!d) return
    setDate(toDDMMYYYY(d))
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className="h-9 w-9 rounded-lg hover:bg-(--dk-mist) transition grid place-items-center cursor-pointer"
        onClick={() => setDate(addDays(dateParam, -1))}
        aria-label="Previous day"
        type="button"
      >
        <ChevronLeft size={18} className="text-(--dk-ink)" />
      </button>

      {/* CLICKABLE date pill (no border) + popover calendar */}
      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 h-9 rounded-lg hover:bg-(--dk-mist) transition cursor-pointer"
          aria-label="Pick a date"
          aria-expanded={open}
        >
          <Calendar size={16} className="text-(--dk-slate)" />
          <span className="text-sm font-semibold text-(--dk-ink)">
            {dateParam}
          </span>
        </button>

        {open ? (
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper) shadow-lg p-3 z-20">
            <p className="text-xs text-(--dk-slate) mb-2">Jump to date</p>

            <input
              type="date"
              value={draftISO}
              onChange={(e) => setDraftISO(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitDraft(draftISO)
              }}
              className="w-full rounded-lg border border-(--dk-ink)/15 bg-transparent px-3 py-2 text-sm text-(--dk-ink) outline-none focus:ring-2 focus:ring-(--dk-sky)/40"
            />

            <div className="mt-3 flex items-center justify-between">
              {/* TODAY BUTTON */}
              <button
                type="button"
                onClick={() => {
                  const t = new Date()
                  t.setHours(0, 0, 0, 0)
                  setDate(toDDMMYYYY(t))
                  setOpen(false)
                }}
                className="text-xs underline text-(--dk-slate) hover:text-(--dk-ink)"
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => commitDraft(draftISO)}
                className="text-xs underline text-(--dk-slate) hover:text-(--dk-ink)"
              >
                Apply
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <button
        className="h-9 w-9 rounded-lg hover:bg-(--dk-mist) transition grid place-items-center cursor-pointer"
        onClick={() => setDate(addDays(dateParam, +1))}
        aria-label="Next day"
        type="button"
      >
        <ChevronRight size={18} className="text-(--dk-ink)" />
      </button>
    </div>
  )
}
