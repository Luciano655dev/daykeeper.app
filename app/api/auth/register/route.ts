import { NextResponse } from "next/server"
import { API_URL } from "@/config"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  const name = (body?.name as string | undefined)?.trim()
  const email = (body?.email as string | undefined)?.trim()
  const password = body?.password as string | undefined

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Missing name, email, or password" },
      { status: 400 }
    )
  }

  // Call your Node API register
  // Expected: Node creates user and sends/creates a 6-digit verification code
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message || data?.error || "Register failed" },
      { status: res.status }
    )
  }

  // If your Node also returns refreshToken, you can set it here (optional)
  // if (data?.refreshToken) { ... set cookie ... }

  return NextResponse.json(
    { ok: true, email, user: data?.user ?? null },
    { status: 201 }
  )
}
