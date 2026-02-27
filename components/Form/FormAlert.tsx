import React from "react"

type Type = "error" | "success" | "info"

const styles: Record<Type, React.CSSProperties> = {
  error: {
    color: "var(--dk-error)",
    background: "color-mix(in srgb, var(--dk-error) 12%, var(--dk-paper))",
    borderColor: "color-mix(in srgb, var(--dk-error) 35%, transparent)",
  },
  success: {
    color: "var(--dk-success)",
    background: "color-mix(in srgb, var(--dk-success) 12%, var(--dk-paper))",
    borderColor: "color-mix(in srgb, var(--dk-success) 35%, transparent)",
  },
  info: {
    color: "var(--dk-sky)",
    background: "color-mix(in srgb, var(--dk-sky) 12%, var(--dk-paper))",
    borderColor: "color-mix(in srgb, var(--dk-sky) 35%, transparent)",
  },
}

export default function FormAlert({
  children,
  type = "error",
}: {
  children: React.ReactNode
  type?: Type
}) {
  return (
    <div
      className="mb-4 rounded-lg px-4 py-3 text-sm"
      style={styles[type]}
    >
      {children}
    </div>
  )
}
