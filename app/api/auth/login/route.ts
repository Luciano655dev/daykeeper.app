import { NextResponse } from "next/server"

import { API_URL } from "@/config"

export async function POST(req: Request) {
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

    const out = NextResponse.json(
      {
        message: data?.message,
        user: data?.user,
        accessToken: data?.accessToken,
      },
      { status: 200 }
    )

    out.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // localhost
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // seconds
    })

    return out
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    )
  }
}
