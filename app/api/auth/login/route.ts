import { NextResponse } from "next/server"

import { API_URL } from "@/config"
import { checkRateLimit } from "@/lib/server/rateLimit"

const isProd = process.env.NODE_ENV === "production"
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60, // seconds
}

export async function POST(req: Request) {
  const limited = checkRateLimit(req, "auth:login", 10, 60_000)
  if (limited) return limited

  try {
    const body = await req.json()

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || "Login failed" },
        { status: res.status }
      )
    }

    // Node must return both:
    // data.accessToken, data.refreshToken, data.user
    const refreshToken = data?.refreshToken
    if (!refreshToken) {
      return NextResponse.json(
        { error: "Missing refreshToken from API" },
        { status: 500 }
      )
    }

    const rawUser = data?.user || null
    const normalizedUser = rawUser
      ? {
          ...rawUser,
          name: rawUser?.username ?? rawUser?.name,
          displayName: rawUser?.displayName ?? rawUser?.username ?? rawUser?.name,
        }
      : null

    const out = NextResponse.json(
      {
        message: data?.message,
        user: normalizedUser,
        accessToken: data?.accessToken,
      },
      { status: 200 }
    )

    out.cookies.set("refreshToken", refreshToken, refreshCookieOptions)

    return out
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
