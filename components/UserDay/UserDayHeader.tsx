"use client"

import Image from "next/image"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

const AVATAR_FALLBACK = "/avatar-placeholder.png"

export default function UserDayHeader({
  user,
  nameFallback,
  onToggleFollow,
  followBusy,
  onOpenUserMenu,
}: {
  user: any
  nameFallback?: string
  onToggleFollow?: () => void
  followBusy?: boolean
  onOpenUserMenu?: () => void
}) {
  const router = useRouter()
  const avatarSrc = user?.profile_picture?.url || AVATAR_FALLBACK

  const displayName =
    user?.displayName || user?.username || nameFallback || "User"
  const handle = user?.handle || user?.username || nameFallback || ""

  const followInfo = user?.follow_info
  const isFollowing = user?.isFollowing

  return (
    <section className="px-4 py-4">
      <div className="flex items-center gap-3">
        <Image
          src={avatarSrc}
          alt={displayName}
          width={48}
          height={48}
          className="h-12 w-12 rounded-sm object-cover cursor-pointer"
          onClick={() => {
            router.push(`/${user?.username}`)
          }}
        />

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => {
            router.push(`/${user?.username}`)
          }}
        >
          <div className="text-[16px] font-semibold text-(--dk-ink) truncate">
            {displayName}
          </div>
          <div className="text-sm text-(--dk-slate) truncate">@{handle}</div>
        </div>

        {followInfo != "same_user" && (
          <button
            type="button"
            onClick={onToggleFollow}
            disabled={followBusy}
            className={
              "h-9 px-3 rounded-lg text-sm font-medium border transition " +
              (isFollowing
                ? "bg-(--dk-paper) border-(--dk-ink)/15 hover:bg-(--dk-mist)"
                : "bg-(--dk-sky) text-white border-(--dk-sky) hover:opacity-90")
            }
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}

        <button
          type="button"
          onClick={onOpenUserMenu}
          className="h-9 w-9 grid place-items-center rounded-lg hover:bg-(--dk-mist) transition"
          aria-label="User options"
        >
          <MoreHorizontal size={18} className="text-(--dk-ink)" />
        </button>
      </div>
    </section>
  )
}
