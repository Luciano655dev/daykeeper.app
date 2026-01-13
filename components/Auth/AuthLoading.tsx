"use client"

import Image from "next/image"

export default function AuthLoading() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: "var(--dk-paper)",
        color: "var(--dk-ink)",
      }}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <Image
          src="/logo-main.svg"
          alt="Daykeeper"
          width={64}
          height={64}
          className="w-auto h-auto"
          priority
        />

        {/* Optional subtle brand accent */}
        <div
          className="h-1 w-12 rounded-full"
          style={{ background: "var(--dk-sky)" }}
        />
      </div>
    </div>
  )
}
