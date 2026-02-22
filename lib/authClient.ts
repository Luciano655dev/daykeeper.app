import { queryClient } from "@/lib/queryClient"

let accessToken: string | null = null
let refreshing: Promise<string | null> | null = null
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export async function logoutClient(reason?: string, redirect = true) {
  setAccessToken(null)
  await queryClient.cancelQueries()
  queryClient.clear()

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
  } catch {}

  if (redirect) {
    window.location.href = "/login"
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing

  refreshing = (async () => {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    })

    if (!res.ok) return null

    const data = await res.json().catch(() => null)
    const newToken = data?.accessToken as string | undefined
    if (!newToken) return null

    setAccessToken(newToken)
    return newToken
  })()

  try {
    return await refreshing
  } finally {
    refreshing = null
  }
}

function mergeHeaders(initHeaders?: HeadersInit): Headers {
  const h = new Headers(initHeaders || {})
  if (accessToken) h.set("Authorization", `Bearer ${accessToken}`)
  return h
}

function shouldResetCache(method?: string) {
  const normalized = (method || "GET").toUpperCase()
  return MUTATION_METHODS.has(normalized)
}

// Use APi (ONLY for Post/Put/Delete) Use query for GET
export async function apiFetch(url: string, init: RequestInit = {}) {
  const requestMethod = (init.method || "GET").toUpperCase()
  const maybeResetCache = (res: Response) => {
    if (res.ok && shouldResetCache(requestMethod)) {
      // Global invalidation avoids stale UI after create/update/delete operations.
      void queryClient.invalidateQueries().catch(() => {})
    }
  }

  const doFetch = () =>
    fetch(url, {
      ...init,
      credentials: "include",
      headers: mergeHeaders(init.headers),
    })

  let res = await doFetch()
  if (res.status !== 401) {
    maybeResetCache(res)
    return res
  }

  const newToken = await refreshAccessToken()
  if (!newToken) {
    await logoutClient("Session expired")
    throw new Error("Session expired")
  }

  res = await doFetch()

  if (res.status === 401) {
    await logoutClient("Session expired")
    throw new Error("Session expired")
  }

  maybeResetCache(res)

  return res
}

export const authClient = { setAccessToken, getAccessToken }
