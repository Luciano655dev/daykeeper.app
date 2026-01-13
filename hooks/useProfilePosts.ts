// /hooks/useProfileDay.ts
"use client"

import { useMemo } from "react"
import { useUserDay } from "@/hooks/useUserDay"
import { parseDDMMYYYY, startOfDay, toDDMMYYYY } from "@/lib/date"

export function useProfileDay(username: string, dateParam: string | null) {
  const safeDateParam = useMemo(() => {
    if (!dateParam) return toDDMMYYYY(startOfDay(new Date()))
    const parsed = parseDDMMYYYY(dateParam)
    if (!parsed) return toDDMMYYYY(startOfDay(new Date()))
    return toDDMMYYYY(startOfDay(parsed))
  }, [dateParam])

  const { loading, error, day, posts } = useUserDay(username, safeDateParam)

  return {
    loading,
    error,
    dateParam: safeDateParam,

    tasks: day?.tasks ?? [],
    notes: day?.notes ?? [],
    events: day?.events ?? [],
    posts: posts ?? [],
  }
}
