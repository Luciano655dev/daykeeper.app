"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import FeedPostItem from "./FeedPostItem"
import FeedUserDayCard from "./FeedUserDayCard"
import { MoreHorizontal, Flag, Ban, ChevronDown } from "lucide-react"
import ReportUserModal from "../common/ReportUserModal"
import BlockUserModal from "../common/BlockUserModal"
import { useRouter } from "next/navigation"
import { toDayParam } from "@/lib/date" // ✅ adjust to your real helper path

const AVATAR_FALLBACK = "/avatar-placeholder.png"

export default function FeedUserDay({
  userDay,
  selectedDate,
}: {
  userDay: any
  selectedDate: any
}) {
  const router = useRouter()
  const avatarSrc = userDay.user_info.profile_picture?.url || AVATAR_FALLBACK
  const username = userDay.user_info.username
  const displayName = userDay?.user_info?.displayName

  const sortedPosts = useMemo(() => {
    const list = [...(userDay.posts || [])]
    return list.sort(
      (a: any, b: any) => Number(!!b.highlighted) - Number(!!a.highlighted),
    )
  }, [userDay.posts])

  const postCount = Number(
    userDay.postCount ??
      userDay.postsCount ??
      userDay.totalPosts ??
      userDay.posts_total ??
      sortedPosts.length,
  )

  const hasMorePosts = postCount > 3

  // menu state
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // modals
  const [reportOpen, setReportOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (menuRef.current.contains(e.target as Node)) return
      setMenuOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }

    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onEsc)
    }
  }, [])

  return (
    <div className="relative">
      <div
        className="flex items-start gap-4 px-4 mb-2 cursor-pointer"
        onClick={() => router.push(`/${username}`)}
      >
        <Image
          src={avatarSrc}
          alt={username}
          width={48}
          height={48}
          className="h-12 w-12 rounded-sm object-cover"
        />

        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-bold text-(--dk-ink) truncate">
                  {displayName}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full border border-(--dk-ink)/10 bg-(--dk-mist)/70 text-(--dk-slate)">
                  {userDay.user_info.currentStreak || 0} Days
                </span>
              </div>

              <p className="text-sm text-(--dk-slate) truncate">@{username}</p>
            </div>

            {/* 3-dots + menu */}
            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                className="h-9 w-9 grid place-items-center rounded-lg bg-(--dk-paper)/60 hover:bg-(--dk-paper) transition text-(--dk-slate) hover:text-(--dk-ink) cursor-pointer"
                aria-label="More options"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setMenuOpen((v) => !v)
                }}
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper) shadow-lg overflow-hidden z-20"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setMenuOpen(false)
                      setReportOpen(true)
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-(--dk-ink)/5 transition text-(--dk-ink)"
                  >
                    <Flag size={16} />
                    Report user
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setMenuOpen(false)
                      setBlockOpen(true)
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-(--dk-ink)/5 transition text-(--dk-ink)"
                  >
                    <Ban size={16} />
                    Block user
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginLeft: "var(--lane-x)",
          paddingRight: "var(--lane-right, 1rem)",
        }}
      >
        <FeedUserDayCard userDay={userDay} selectedDate={selectedDate} />

        <div className="space-y-4">
          {sortedPosts.map((post, idx) => (
            <FeedPostItem
              key={post.id}
              post={post}
              isLast={idx === sortedPosts.length - 1}
            />
          ))}

          {hasMorePosts ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(
                  `/day/${userDay.user_info.username}?date=${toDayParam(
                    selectedDate,
                  )}`,
                )
              }}
              className="w-full transition px-4 py-1 text-sm text-(--dk-sky) font-medium flex items-center justify-center gap-2 cursor-pointer hover:text-(--dk-sky)/80"
            >
              <span>See more</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* modals */}
      <ReportUserModal
        username={String(username)}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />

      <BlockUserModal
        username={String(username)}
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
      />
    </div>
  )
}
