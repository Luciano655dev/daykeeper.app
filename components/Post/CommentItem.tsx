"use client"

import Image from "next/image"
import type { PostComment } from "@/hooks/usePostComments"

const AVATAR_FALLBACK = "/avatar-placeholder.png"

function formatRelative(dateStr: string) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ""
  const diff = Date.now() - d.getTime()

  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h`
  const day = Math.floor(hr / 24)
  return `${day}d`
}

export default function CommentItem({ c }: { c: PostComment }) {
  const avatar = c.user?.profile_picture?.url || AVATAR_FALLBACK
  const handle = c.user?.username ? `@${c.user.username}` : ""

  return (
    <div className="px-4 py-4 border-b border-(--dk-ink)/10">
      <div className="flex items-start gap-3">
        <Image
          src={avatar}
          alt={c.user?.username || "User"}
          width={36}
          height={36}
          className="h-9 w-9 rounded-md object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-(--dk-ink) truncate">
              {c.user?.username}
            </span>
            <span className="text-sm text-(--dk-slate) truncate">{handle}</span>
            <span className="text-sm text-(--dk-slate)">·</span>
            <span className="text-sm text-(--dk-slate)">
              {formatRelative(c.created_at)}
            </span>
          </div>

          <p className="mt-1 text-(--dk-ink) text-[15px] leading-relaxed whitespace-pre-wrap">
            {c.comment}
          </p>
        </div>
      </div>
    </div>
  )
}
