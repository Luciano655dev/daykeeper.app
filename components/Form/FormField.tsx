"use client"

import { useMemo, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

type Props = {
  label: string
  hint?: string
  rightSlot?: React.ReactNode

  multiline?: boolean
  rows?: number

  maxLength?: number
  showCount?: boolean

  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>
}

export default function FormField({
  label,
  hint,
  rightSlot,
  inputProps,
  textareaProps,

  multiline = false,
  rows,

  maxLength,
  showCount = true,
}: Props) {
  const isPassword = !multiline && inputProps?.type === "password"
  const [showPassword, setShowPassword] = useState(false)

  const valueLength = useMemo(() => {
    const v = multiline ? textareaProps?.value : inputProps?.value
    return typeof v === "string" ? v.length : 0
  }, [multiline, inputProps?.value, textareaProps?.value])

  const baseClass = [
    "w-full rounded-lg border border-transparent px-4 py-3 pr-11 text-sm outline-none transition",
    "bg-(--dk-mist)/45",
    "focus:border-(--dk-sky)/35 focus:bg-(--dk-paper)",
    "text-(--dk-ink)",
    multiline ? "resize-none min-h-[140px]" : "",
  ]
    .filter(Boolean)
    .join(" ")

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (typeof maxLength === "number" && e.target.value.length > maxLength)
      return
    inputProps?.onChange?.(e)
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (typeof maxLength === "number" && e.target.value.length > maxLength)
      return
    textareaProps?.onChange?.(e)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-(--dk-ink)">{label}</label>

        <div className="flex items-center gap-3">
          {typeof maxLength === "number" && showCount && (
            <div className="text-xs text-(--dk-slate)">
              {valueLength}/{maxLength}
            </div>
          )}
          {rightSlot}
        </div>
      </div>

      <div className="relative mt-2">
        {multiline ? (
          <textarea
            {...textareaProps}
            rows={rows ?? 4}
            maxLength={maxLength}
            className={baseClass}
            onChange={handleTextareaChange}
          />
        ) : (
          <input
            {...inputProps}
            maxLength={maxLength}
            type={
              isPassword
                ? showPassword
                  ? "text"
                  : "password"
                : inputProps?.type
            }
            className={baseClass}
            onChange={handleInputChange}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-(--dk-slate)"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {hint && <div className="mt-2 text-xs text-(--dk-slate)">{hint}</div>}
    </div>
  )
}
