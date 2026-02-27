"use client"

import { brand } from "../brand"

type ButtonVariant = "primary" | "secondary" | "ghost"

export default function FormButton({
  children,
  disabled,
  type = "button",
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode
  disabled?: boolean
  type?: "button" | "submit"
  onClick?: () => void
  variant?: ButtonVariant
}) {
  const styles = getVariantStyles(variant)

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-lg px-4 py-3 text-sm font-medium transition hover:brightness-95 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
      style={{ ...styles.base, boxShadow: "none" }}
    >
      {children}
    </button>
  )
}

/* ---------------------------------- */

function getVariantStyles(variant: ButtonVariant) {
  switch (variant) {
    case "secondary":
      return {
        base: {
          background: "color-mix(in srgb, var(--dk-mist) 80%, var(--dk-paper))",
          color: brand.sky,
        },
      }

    case "ghost":
      return {
        base: {
          background: "transparent",
          color: brand.sky,
        },
      }

    case "primary":
    default:
      return {
        base: {
          background: brand.sky,
          color: brand.paper,
        },
      }
  }
}
