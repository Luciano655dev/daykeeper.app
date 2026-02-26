"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  CalendarPlus,
  CheckSquare2,
  FileText,
  PlusSquare,
  SquarePen,
  X,
} from "lucide-react"

type Variant = "mobile" | "desktop"

type CreateItem = {
  href: string
  label: string
  icon: any
  subtitle: string
}

const CREATE_ITEMS: CreateItem[] = [
  {
    href: "/post/create",
    label: "Post",
    icon: SquarePen,
    subtitle: "Share on your timeline",
  },
  {
    href: "/day/notes/create",
    label: "Note",
    icon: FileText,
    subtitle: "Write a quick note",
  },
  {
    href: "/day/events/create",
    label: "Event",
    icon: CalendarPlus,
    subtitle: "Add something scheduled",
  },
  {
    href: "/day/tasks/create",
    label: "Task",
    icon: CheckSquare2,
    subtitle: "Track something to do",
  },
]

function isCreateRoute(pathname: string) {
  return CREATE_ITEMS.some((item) => pathname === item.href)
}

export default function CreateMenuButton({ variant }: { variant: Variant }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const active = useMemo(() => isCreateRoute(pathname), [pathname])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = panelRef.current
      if (!el) return
      if (el.contains(e.target as Node)) return
      setOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
    }
  }, [open])

  if (variant === "mobile") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Create"
          className={[
            "flex items-center justify-center p-3 rounded-xl transition-all",
            active || open
              ? "text-(--dk-sky)"
              : "text-(--dk-slate) hover:text-(--dk-ink)",
          ].join(" ")}
        >
          <PlusSquare
            size={24}
            className={active || open ? "stroke-[2.4]" : "stroke-2"}
          />
        </button>

        {open ? (
          <div className="lg:hidden fixed inset-0 z-[2147483647]">
            <button
              type="button"
              aria-label="Close create menu"
              className="absolute inset-0 bg-black/20"
              onClick={() => setOpen(false)}
            />

            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-(--dk-ink)/10 bg-(--dk-paper) shadow-[0_-12px_28px_rgba(15,23,42,0.12)] p-4 pb-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-(--dk-ink)">
                  Create
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-(--dk-mist) text-(--dk-slate)"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {CREATE_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper) p-3 text-left hover:bg-(--dk-mist) transition"
                    >
                      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--dk-sky)/10 text-(--dk-sky)">
                        <Icon size={18} />
                      </div>
                      <div className="text-sm font-semibold text-(--dk-ink)">
                        {item.label}
                      </div>
                      <div className="text-xs text-(--dk-slate)">
                        {item.subtitle}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  const desktopPanel =
    open && typeof document !== "undefined" && triggerRef.current
      ? (() => {
          const rect = triggerRef.current.getBoundingClientRect()
          const top = rect.top + rect.height / 2
          const left = rect.right + 8

          return createPortal(
            <>
              <button
                type="button"
                aria-label="Close create menu"
                className="fixed inset-0 z-[2147483646]"
                onClick={() => setOpen(false)}
              />

              <div
                ref={panelRef}
                role="menu"
                className="fixed z-[2147483647] w-72 rounded-2xl border border-(--dk-ink)/10 bg-(--dk-paper) shadow-[0_10px_24px_rgba(15,23,42,0.10)] p-2"
                style={{
                  top,
                  left,
                  transform: "translateY(-50%)",
                }}
              >
                {CREATE_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-(--dk-mist) transition"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--dk-sky)/10 text-(--dk-sky)">
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-(--dk-ink)">
                          {item.label}
                        </span>
                        <span className="block text-xs text-(--dk-slate)">
                          {item.subtitle}
                        </span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </>,
            document.body
          )
        })()
      : null

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="w-full bg-(--dk-sky) text-white py-3.5 rounded-xl flex justify-center gap-2 hover:opacity-95 transition"
      >
        <PlusSquare size={20} />
        Create
      </button>

      {desktopPanel}
    </div>
  )
}
