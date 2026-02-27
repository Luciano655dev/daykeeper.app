"use client"

import { brand } from "../brand"

export default function FormSocialButton({
  icon,
  children,
  onClick,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
}) {
  const disabled = true
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition"
      style={{
        background: "color-mix(in srgb, var(--dk-mist) 85%, var(--dk-paper))",
        color: brand.ink,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? "40%" : "100%",
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {children}
    </button>
  )
}
