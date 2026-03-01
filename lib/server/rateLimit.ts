import { NextResponse } from "next/server"

type Hit = {
  count: number
  resetAt: number
}

const bucket = new Map<string, Hit>()

function parseIpFromXForwardedFor(value: string | null): string | null {
  if (!value) return null
  const first = value.split(",")[0]?.trim()
  return first || null
}

function getClientIp(req: Request): string {
  const fromXff = parseIpFromXForwardedFor(req.headers.get("x-forwarded-for"))
  if (fromXff) return fromXff
  const fromRealIp = req.headers.get("x-real-ip")?.trim()
  if (fromRealIp) return fromRealIp
  return "unknown"
}

export function checkRateLimit(
  req: Request,
  keyPrefix: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const ip = getClientIp(req)
  const now = Date.now()
  const key = `${keyPrefix}:${ip}`
  const current = bucket.get(key)

  if (!current || current.resetAt <= now) {
    bucket.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (current.count >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((current.resetAt - now) / 1000),
    )

    return NextResponse.json(
      { error: "Too many requests. Please try again in a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      },
    )
  }

  current.count += 1
  bucket.set(key, current)
  return null
}
