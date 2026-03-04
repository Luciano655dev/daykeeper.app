"use client"

import { useQuery } from "@tanstack/react-query"
import { apiJson } from "@/lib/api"
import { API_URL } from "@/config"

export type CalendarPoint = {
  date: string
  count: number
  postsCount: number
  tasksCount: number
  eventsCount: number
  interactions?: Array<{
    type: "post" | "task" | "event"
    count: number
  }>
  level: 0 | 1 | 2 | 3 | 4
}

export type UserCalendarData = {
  userId: string
  username: string
  timeZone: string
  days: number
  from: string
  to: string
  totalCount: number
  maxCount: number
  range?: "rolling" | "custom" | "all"
  points: CalendarPoint[]
}

type ApiOk<T> = {
  code?: number
  message?: string
  data?: T
}

type UserCalendarParams = {
  days?: number
  startDate?: string
  endDate?: string
  scope?: "all"
}

export function useUserCalendar(
  username: string | null,
  params: UserCalendarParams = {}
) {
  const query = new URLSearchParams()
  if (params.scope) query.set("scope", params.scope)
  if (params.startDate) query.set("startDate", params.startDate)
  if (params.endDate) query.set("endDate", params.endDate)
  if (typeof params.days === "number") query.set("days", String(params.days))

  const qs = query.toString()
  const suffix = qs ? `?${qs}` : ""

  return useQuery({
    queryKey: ["userCalendar", username, params],
    enabled: !!username,
    queryFn: () =>
      apiJson<ApiOk<UserCalendarData>>(
        `${API_URL}/${encodeURIComponent(String(username))}/calendar${suffix}`,
        { method: "GET" },
      ),
    select: (res) => res?.data ?? null,
  })
}
