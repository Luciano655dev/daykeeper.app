import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { API_URL } from "@/config"

export async function POST() {
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
    out.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
    return out
  } catch (e: any) {
    const out = NextResponse.json({ ok: false }, { status: 200 })
    out.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
    return out
  }
}
