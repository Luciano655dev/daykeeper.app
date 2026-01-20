"use client"

import { Globe, Users, Lock } from "lucide-react"

export type PrivacyValue = "public" | "private" | "close friends"

type Option = {
  value: PrivacyValue
  label: string
  hint: string
  Icon: any
}

const OPTIONS: Option[] = [
  { value: "public", label: "Public", hint: "Anyone can see", Icon: Globe },
  {
    value: "close friends",
    label: "Close",
    hint: "Only close friends",
    Icon: Users,
  },
  { value: "private", label: "Private", hint: "Only you", Icon: Lock },
]

export default function PrivacyPicker({
  value,
  onChange,
}: {
  value: PrivacyValue
  onChange: (v: PrivacyValue) => void
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-(--dk-ink)">Privacy</div>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const active = value === opt.value
          const Icon = opt.Icon

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "rounded-xl border px-3 py-2 text-left transition",
                "flex flex-col gap-1",
                active
                  ? "border-(--dk-sky) bg-(--dk-sky)/10 text-(--dk-sky)"
                  : "border-(--dk-ink)/10 bg-(--dk-paper) text-(--dk-ink)",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <Icon size={16} />
                <span className="text-sm font-medium">{opt.label}</span>
              </div>

              <div
                className={[
                  "text-[11px]",
                  active ? "text-(--dk-sky)" : "text-(--dk-slate)",
                ].join(" ")}
              >
                {opt.hint}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
