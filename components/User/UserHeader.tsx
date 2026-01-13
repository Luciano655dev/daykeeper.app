"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import {
  Flame,
  Trophy,
  Users,
  UserPlus,
  Lock,
  Globe,
  Pencil,
} from "lucide-react"
import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"

const AVATAR_FALLBACK = "/avatar-placeholder.png"

export default function ProfileHeader({ user }: { user: any }) {
  const avatar = user?.profile_picture?.url || AVATAR_FALLBACK

  const currentStreak = user?.currentStreak ?? user?.currentStrike ?? 0
  const maxStreak = user?.maxStreak ?? user?.maxStrike ?? 0

  const isPrivate = !!user?.private
  const isSelf = user?.follow_info == "same_user"

  const username = String(user?.displayName || "User")
  const handle = String(user?.username || user?.username || user?.name || "")

  const bio = String(user?.bio || "").trim()

  // --- optimistic follow state ---
  const initialFollowing = !!user?.isFollowing
  const initialFollowers = Number.isFinite(user?.followers) ? user.followers : 0
  const initialFollowingCount = Number.isFinite(user?.following)
    ? user.following
    : 0

  const [isFollowing, setIsFollowing] = useState<boolean>(initialFollowing)
  const [followers, setFollowers] = useState<number>(initialFollowers)
  const [followingCount] = useState<number>(initialFollowingCount) // you probably don't want to change this on follow toggle
  const [busy, setBusy] = useState(false)

  // tiny animation flag
  const [pulse, setPulse] = useState(false)

  // keep local state in sync if a different user loads
  useEffect(() => {
    setIsFollowing(!!user?.isFollowing)
    setFollowers(Number.isFinite(user?.followers) ? user.followers : 0)
  }, [user?._id])

  const followEndpoint = useMemo(() => {
    // route: /:name/follow
    return `${API_URL}/${encodeURIComponent(handle)}/follow`
  }, [handle])

  async function toggleFollow() {
    if (busy || isSelf) return

    const prevFollowing = isFollowing
    const prevFollowers = followers

    // optimistic UI update
    const next = !prevFollowing
    setIsFollowing(next)
    setFollowers((c) => {
      const base = Number.isFinite(c) ? c : 0
      return next ? base + 1 : Math.max(0, base - 1)
    })

    // trigger micro animation
    setPulse(true)
    window.setTimeout(() => setPulse(false), 180)

    setBusy(true)
    try {
      const res = await apiFetch(followEndpoint, {
        method: "POST",
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Request failed (${res.status})`)
      }

      // optional: if your API returns updated counts, you can sync here:
      // const json = await res.json().catch(() => null)
      // if (json?.data?.followers != null) setFollowers(json.data.followers)
      // if (json?.data?.isFollowing != null) setIsFollowing(!!json.data.isFollowing)
    } catch {
      // revert on failure
      setIsFollowing(prevFollowing)
      setFollowers(prevFollowers)
    } finally {
      setBusy(false)
    }
  }

  return (
    <header className="px-4 pt-5 pb-4">
      {/* top block */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        {/* left: avatar + identity */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-(--dk-mist)/40">
            <Image
              src={avatar}
              alt={username}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <h1 className="text-xl font-semibold text-(--dk-ink) truncate">
                {username}
              </h1>
              <PrivacyBadge isPrivate={isPrivate} />
            </div>

            <div className="mt-0.5 text-sm text-(--dk-slate) truncate">
              @{handle}
            </div>
          </div>
        </div>

        {/* right: action button */}
        <div className="sm:ml-auto">
          <ActionButton
            isSelf={isSelf}
            isFollowing={isFollowing}
            busy={busy}
            pulse={pulse}
            onClick={toggleFollow}
          />
        </div>
      </div>

      {/* bio */}
      <div className="mt-3">
        {bio ? (
          <p className="text-sm text-(--dk-ink)/85 leading-relaxed">{bio}</p>
        ) : (
          <p className="text-sm text-(--dk-slate)">No bio yet.</p>
        )}
      </div>

      {/* stats (responsive wrap) */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-(--dk-slate)">
        <Stat icon={Users} value={followers} label="followers" />
        <Stat icon={UserPlus} value={followingCount} label="following" />

        <span className="hidden sm:inline-block h-3 w-px bg-(--dk-ink)/10" />

        <Stat icon={Flame} value={currentStreak} label="day streak" accent />
        <Stat icon={Trophy} value={maxStreak} label="best streak" accent />
      </div>
    </header>
  )
}

function PrivacyBadge({ isPrivate }: { isPrivate: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-(--dk-mist)/35 text-(--dk-slate) whitespace-nowrap">
      {isPrivate ? <Lock size={14} /> : <Globe size={14} />}
      {isPrivate ? "Private" : "Public"}
    </span>
  )
}

function ActionButton({
  isSelf,
  isFollowing,
  busy,
  pulse,
  onClick,
}: {
  isSelf: boolean
  isFollowing: boolean
  busy: boolean
  pulse: boolean
  onClick: () => void
}) {
  const base =
    "w-full sm:w-auto h-10 px-4 rounded-xl text-sm font-medium transition inline-flex items-center justify-center select-none"

  if (isSelf) {
    return (
      <button
        type="button"
        className={`${base} gap-2 bg-(--dk-mist)/35 text-(--dk-ink) hover:bg-(--dk-mist)/55 cursor-pointer`}
      >
        <Pencil size={16} className="text-(--dk-slate)" />
        Edit profile
      </button>
    )
  }

  // micro animation on change (scale pop)
  const pop = pulse ? "scale-[1.03]" : "scale-100"

  if (isFollowing) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={`${base} ${pop} bg-(--dk-mist)/35 text-(--dk-ink) hover:bg-(--dk-mist)/55 disabled:opacity-60 cursor-pointer`}
      >
        Following
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`${base} ${pop} font-semibold bg-(--dk-sky) text-white hover:opacity-90 disabled:opacity-70 cursor-pointer`}
    >
      Follow
    </button>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
  accent = false,
}: {
  icon: React.ComponentType<any>
  value: number
  label: string
  accent?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <Icon
        size={16}
        className={accent ? "text-(--dk-sky)" : "text-(--dk-slate)"}
      />
      <span className="font-semibold text-(--dk-ink)">{value}</span>
      <span>{label}</span>
    </span>
  )
}
