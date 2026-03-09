"use client"

import { Check } from "lucide-react"

type TaskCompletionToggleProps = {
  done: boolean
  clickable?: boolean
  busy?: boolean
  onToggle?: () => void
  showLabel?: boolean
  doneLabel?: string
  notDoneLabel?: string
  className?: string
}

export default function TaskCompletionToggle({
  done,
  clickable = false,
  busy = false,
  onToggle,
  showLabel = false,
  doneLabel = "Completed",
  notDoneLabel = "Not completed",
  className = "",
}: TaskCompletionToggleProps) {
  const label = done ? doneLabel : notDoneLabel
  const interactive = clickable && !busy

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!interactive) return
        onToggle?.()
      }}
      disabled={!interactive}
      aria-label={done ? "Task completed" : "Task not completed"}
      title={
        clickable
          ? done
            ? "Mark as not completed"
            : "Mark as completed"
          : label
      }
      className={[
        "inline-flex items-center justify-center rounded-lg transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--dk-sky)/45",
        showLabel ? "gap-2 px-1 py-1 text-sm font-medium" : "h-10 w-10",
        clickable ? "cursor-pointer" : "cursor-default",
        done ? "text-(--dk-sky)" : "text-(--dk-slate)",
        busy ? "opacity-75" : "",
        interactive
          ? done
            ? "hover:text-(--dk-sky)"
            : "hover:text-(--dk-ink)"
          : "opacity-80",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex items-center justify-center rounded-[5px]",
          showLabel ? "h-5 w-5" : "h-6 w-6",
          done
            ? "bg-(--dk-sky)"
            : "bg-(--dk-paper) shadow-[inset_0_0_0_1.5px_rgba(15,23,42,0.22)]",
        ].join(" ")}
      >
        {done ? <Check size={12} className="text-white stroke-[2.7]" /> : null}
      </span>

      {showLabel ? <span>{label}</span> : null}
    </button>
  )
}
