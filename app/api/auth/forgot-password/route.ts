import { NextResponse } from "next/server"

import { API_URL } from "@/config"
import { checkRateLimit } from "@/lib/server/rateLimit"

export async function POST(req: Request) {
  const limited = checkRateLimit(req, "auth:forgot-password", 5, 60_000)
  if (limited) return limited

  const body = await req.json().catch(() => null)
  const email = (body?.email as string | undefined)?.trim()

  // Always generic to avoid enumeration
  if (!email) {
    return NextResponse.json(
      { message: "If that email exists, we sent a reset link." },
      { status: 201 }
    )
  }

  await fetch(`${API_URL}/auth/forget_password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).catch(() => null)

  return NextResponse.json(
    { message: "If that email exists, we sent a reset link." },
    { status: 202 }
  )
}
