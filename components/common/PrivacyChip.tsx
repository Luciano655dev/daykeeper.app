"use client"

import { Lock, Users } from "lucide-react"

export default function PrivacyChip({
  privacy,
}: {
  privacy?: String // "public" | "private" | "close friends"
}) {
  if (!privacy || privacy === "public") return null

  const isPrivate = privacy === "private"

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border border-(--dk-ink)/10 bg-(--dk-paper) text-(--dk-slate)">
      {isPrivate ? <Lock size={12} /> : <Users size={12} />}
      <span>{isPrivate ? "Private" : "Close friends"}</span>
    </span>
  )
}
