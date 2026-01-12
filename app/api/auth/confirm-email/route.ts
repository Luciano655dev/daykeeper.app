import { NextResponse } from "next/server"
import { API_URL } from "@/config"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = (body?.email as string | undefined)?.trim()
  const code = (body?.code as string | undefined)?.trim()

  if (!email || !code) {
    return NextResponse.json(
      { error: "Missing email or code" },
      { status: 400 }
    )
  }

  const res = await fetch(`${API_URL}/auth/confirm_email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, verificationCode: code }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message || data?.error || "Confirm failed" },
      { status: res.status }
    )
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
