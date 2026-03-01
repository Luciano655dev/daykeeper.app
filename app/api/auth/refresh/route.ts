import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { API_URL } from "@/config"
import { checkRateLimit } from "@/lib/server/rateLimit"
const isProd = process.env.NODE_ENV === "production"

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60,
}

export async function POST(req: Request) {
  const limited = checkRateLimit(req, "auth:refresh", 60, 60_000)
  if (limited) return limited

  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refreshToken")?.value

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 403 })
  }

  const h = await headers()

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": h.get("user-agent") ?? "",
      "X-Forwarded-For": h.get("x-forwarded-for") ?? "",
    },
    body: JSON.stringify({ refreshToken }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const out = NextResponse.json(
      { error: data?.message || "Refresh failed" },
      { status: res.status } // keep Node status
    )

    out.cookies.set("refreshToken", "", { ...refreshCookieOptions, maxAge: 0 })
    return out
  }

  const accessToken = data?.accessToken as string | undefined
  if (!accessToken) {
    const out = NextResponse.json(
      { error: "No access token returned" },
      { status: 502 }
    )
    out.cookies.set("refreshToken", "", { ...refreshCookieOptions, maxAge: 0 })
    return out
  }

  const out = NextResponse.json({ accessToken }, { status: 200 })

  // rotate cookie if Node returned a new refresh token
  if (data?.refreshToken) {
    out.cookies.set("refreshToken", data.refreshToken, refreshCookieOptions)
  }

  return out
}
