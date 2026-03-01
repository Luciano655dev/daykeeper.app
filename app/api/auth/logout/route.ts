import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { API_URL } from "@/config"
import { checkRateLimit } from "@/lib/server/rateLimit"

const isProd = process.env.NODE_ENV === "production"
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
}

export async function POST(req: Request) {
  const limited = checkRateLimit(req, "auth:logout", 30, 60_000)
  if (limited) return limited

  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refreshToken")?.value

    // best effort revoke on Node (optional but good)
    if (refreshToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => null)
    }

    const out = NextResponse.json({ ok: true }, { status: 200 })
    out.cookies.set("refreshToken", "", refreshCookieOptions)
    return out
  } catch {
    const out = NextResponse.json({ ok: false }, { status: 200 })
    out.cookies.set("refreshToken", "", refreshCookieOptions)
    return out
  }
}
