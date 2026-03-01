import { NextResponse } from "next/server"
import { API_URL } from "@/config"
import { checkRateLimit } from "@/lib/server/rateLimit"

export async function POST(req: Request) {
  const limited = checkRateLimit(req, "auth:reset-password", 6, 60_000)
  if (limited) return limited

  const body = await req.json().catch(() => null)

  const email = (body?.email as string | undefined)?.trim()
  const token = (body?.code as string | undefined)?.trim()
  const newPassword = body?.newPassword as string | undefined

  if (!email || !token || !newPassword) {
    return NextResponse.json(
      { error: "Missing email, token, or new password" },
      { status: 400 }
    )
  }

  const res = await fetch(`${API_URL}/auth/reset_password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      verificationCode: token,
      password: newPassword,
    }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message || data?.error || "Reset failed" },
      { status: res.status }
    )
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
