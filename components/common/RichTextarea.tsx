"use client"

import { useRef } from "react"
import RichText from "@/components/common/RichText"

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
  showCount?: boolean
  className?: string
  renderPreview?: boolean
}

export default function RichTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
  showCount = false,
  className,
  renderPreview = true,
}: Props) {
  const previewRef = useRef<HTMLDivElement | null>(null)

  if (!renderPreview) {
    return (
      <div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={[
            "w-full rounded-lg border border-transparent",
            "bg-(--dk-mist)/45 px-3 py-2 text-sm leading-relaxed text-(--dk-ink)",
            "focus:outline-none focus:ring-2 focus:ring-(--dk-sky)/30",
            "selection:bg-(--dk-sky)/20",
            className ?? "",
          ].join(" ")}
        />

        {showCount && typeof maxLength === "number" ? (
          <div className="mt-1 text-xs text-(--dk-slate)">
            {value.length}/{maxLength}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={previewRef}
          className={[
            "absolute inset-0 rounded-lg border border-transparent",
            "bg-(--dk-mist)/45",
            "px-3 py-2 text-sm leading-relaxed",
            "pointer-events-none",
            "overflow-hidden",
            className ?? "",
          ].join(" ")}
        >
          {value ? (
            <RichText text={value} stopPropagation />
          ) : (
            <span className="text-(--dk-slate)">{placeholder}</span>
          )}
        </div>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          onScroll={(e) => {
            if (previewRef.current) {
              previewRef.current.scrollTop = e.currentTarget.scrollTop
            }
          }}
          className={[
            "relative w-full rounded-lg",
            "bg-transparent px-3 py-2 text-sm leading-relaxed",
            "text-transparent caret-(--dk-ink)",
            "focus:outline-none focus:ring-2 focus:ring-(--dk-sky)/30",
            "selection:bg-(--dk-sky)/20",
            className ?? "",
          ].join(" ")}
          style={{ WebkitTextFillColor: "transparent" }}
        />
      </div>

      {showCount && typeof maxLength === "number" ? (
        <div className="mt-1 text-xs text-(--dk-slate)">
          {value.length}/{maxLength}
        </div>
      ) : null}
    </div>
  )
}
