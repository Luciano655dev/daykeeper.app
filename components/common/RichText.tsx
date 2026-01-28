"use client"

import Link from "next/link"

const TOKEN =
  /(@[A-Za-z0-9_]{1,30}|#[A-Za-z0-9_]{1,30}|https?:\/\/[^\s]+|www\.[^\s]+|[A-Za-z0-9-]+\.[A-Za-z]{2,}(?:\/[^\s]*)?)/g
const TRAIL_PUNCT = /[),.!?:;\]]+$/
const DOMAIN_ONLY =
  /^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+(?::\d+)?(?:\/[^\s]*)?$/

type Part =
  | { type: "text"; value: string }
  | { type: "mention" | "link" | "hashtag"; value: string; suffix?: string }

function splitParts(text: string): Part[] {
  if (!text) return [{ type: "text", value: "" }]

  const raw = text.split(TOKEN)
  const parts: Part[] = []

  for (const chunk of raw) {
    if (!chunk) continue

    if (chunk.startsWith("@")) {
      const core = chunk.replace(TRAIL_PUNCT, "")
      const suffix = chunk.slice(core.length)
      parts.push({ type: "mention", value: core, suffix })
      continue
    }

    if (chunk.startsWith("#")) {
      const core = chunk.replace(TRAIL_PUNCT, "")
      const suffix = chunk.slice(core.length)
      parts.push({ type: "hashtag", value: core, suffix })
      continue
    }

    if (
      chunk.startsWith("http://") ||
      chunk.startsWith("https://") ||
      chunk.startsWith("www.") ||
      DOMAIN_ONLY.test(chunk.replace(TRAIL_PUNCT, ""))
    ) {
      const core = chunk.replace(TRAIL_PUNCT, "")
      const suffix = chunk.slice(core.length)
      parts.push({ type: "link", value: core, suffix })
      continue
    }

    parts.push({ type: "text", value: chunk })
  }

  return parts
}

export default function RichText({
  text,
  className,
  stopPropagation = true,
}: {
  text: string
  className?: string
  stopPropagation?: boolean
}) {
  const parts = splitParts(text)

  return (
    <span className={className}>
      {parts.map((p, idx) => {
        if (p.type === "text") return <span key={`t-${idx}`}>{p.value}</span>

        if (p.type === "mention") {
          const username = p.value.slice(1)
          return (
            <span key={`m-${idx}`}>
            <Link
              href={`/search?type=User&q=${encodeURIComponent(username)}`}
              className="text-(--dk-sky) hover:underline"
              onClick={(e) => {
                if (stopPropagation) e.stopPropagation()
              }}
            >
              {p.value}
            </Link>
              {p.suffix}
            </span>
          )
        }

        if (p.type === "hashtag") {
          const tag = p.value.slice(1)
          return (
            <span key={`h-${idx}`}>
              <Link
                href={`/search?type=Post&q=${encodeURIComponent(tag)}`}
                className="text-(--dk-sky) hover:underline"
                onClick={(e) => {
                  if (stopPropagation) e.stopPropagation()
                }}
              >
                {p.value}
              </Link>
              {p.suffix}
            </span>
          )
        }

        const href =
          p.value.startsWith("http://") || p.value.startsWith("https://")
            ? p.value
            : `https://${p.value}`

        return (
          <span key={`l-${idx}`}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-(--dk-sky) hover:underline"
              onClick={(e) => {
                if (stopPropagation) e.stopPropagation()
              }}
            >
              {p.value}
            </a>
            {p.suffix}
          </span>
        )
      })}
    </span>
  )
}
