let accessToken: string | null = null
let refreshing: Promise<string | null> | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

async function logoutClient(reason?: string) {
  setAccessToken(null)

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
  } catch {}

  window.location.href = "/login"
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

/**
 * apiFetch
 * - Uses access token (in memory) to call Node
 * - On 401: refresh once via /api/auth/refresh and retry once
 */
export async function apiFetch(url: string, init: RequestInit = {}) {
  const doFetch = () =>
    fetch(url, {
      ...init,
      credentials: "include",
      headers: mergeHeaders(init.headers),
    })

  let res = await doFetch()
  if (res.status !== 401) return res

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

  return res
}

export const authClient = { setAccessToken, getAccessToken }
