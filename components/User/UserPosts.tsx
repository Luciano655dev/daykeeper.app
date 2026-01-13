"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import PostsHeader from "@/components/User/PostsHeader"

import UserDaySection from "@/components/UserDay/UserDaySection"
import UserDayTasks from "@/components/UserDay/UserDayTasks"
import UserDayNotes from "@/components/UserDay/UserDayNotes"
import UserDayEvents from "@/components/UserDay/UserDayEvents"
import UserDayPosts from "@/components/UserDay/UserDayPosts"

import { useProfileDay } from "@/hooks/useProfilePosts"
import { isSameDay, parseDDMMYYYY, startOfDay, toDDMMYYYY } from "@/lib/date"

type Props = {
  username: string
  className?: string
}

export default function ProfileDaySections({ username, className }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlDateParam = searchParams.get("date")

  // local UI state for header display
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search)
      const raw = sp.get("date")
      const parsed = raw ? parseDDMMYYYY(raw) : null
      if (parsed) return startOfDay(parsed)
    }
    return startOfDay(new Date())
  })

  const { loading, error, tasks, notes, events, posts } = useProfileDay(
    username,
    urlDateParam
  )

  const setDate = useCallback(
    (d: Date) => {
      const next = startOfDay(d)
      setSelectedDate(next)

      const qs = new URLSearchParams(searchParams.toString())
      qs.set("date", toDDMMYYYY(next))

      router.replace(`${pathname}?${qs.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  // sync selectedDate if URL changes (back/forward, manual edits)
  useEffect(() => {
    if (!urlDateParam) return
    const parsed = parseDDMMYYYY(urlDateParam)
    if (!parsed) return

    setSelectedDate((prev) =>
      isSameDay(prev, parsed) ? prev : startOfDay(parsed)
    )
  }, [urlDateParam])

  // ensure URL always has ?date=...
  useEffect(() => {
    if (typeof window === "undefined") return

    const sp = new URLSearchParams(window.location.search)
    if (sp.get("date")) return

    const qs = new URLSearchParams(searchParams.toString())
    qs.set("date", toDDMMYYYY(startOfDay(new Date())))
    router.replace(`${pathname}?${qs.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const changeDate = useCallback(
    (days: number) => {
      const next = new Date(selectedDate)
      next.setDate(next.getDate() + days)
      setDate(next)
    },
    [selectedDate, setDate]
  )

  const isToday = useMemo(
    () => isSameDay(selectedDate, new Date()),
    [selectedDate]
  )

  // counts for header (you can change this to just posts if you want)
  const entriesCount =
    (tasks?.length ?? 0) +
    (notes?.length ?? 0) +
    (events?.length ?? 0) +
    (posts?.length ?? 0)

  return (
    <section className={className}>
      <PostsHeader
        selectedDate={selectedDate}
        onChangeDate={changeDate}
        onSelectDate={setDate}
        isToday={isToday}
        loading={loading}
        error={error}
        usersCount={entriesCount} // rename inside header later if you want
        onRetry={() => setDate(selectedDate)}
      />

      {loading && (
        <div className="px-4 py-6 text-sm text-(--dk-slate)">Loading…</div>
      )}

      {!loading && error && (
        <div className="px-4 py-6 text-sm text-red-500">{error}</div>
      )}

      {!loading && !error && (
        <>
          <UserDaySection title="Tasks" count={tasks.length}>
            <UserDayTasks tasks={tasks} />
          </UserDaySection>

          <UserDaySection title="Notes" count={notes.length}>
            <UserDayNotes notes={notes} />
          </UserDaySection>

          <UserDaySection title="Events" count={events.length}>
            <UserDayEvents events={events} />
          </UserDaySection>

          <UserDaySection title="Posts" count={posts.length}>
            <UserDayPosts posts={posts} />
          </UserDaySection>
        </>
      )}
    </section>
  )
}
