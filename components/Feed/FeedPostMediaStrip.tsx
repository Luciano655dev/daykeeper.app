"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import type { FeedMedia } from "@/lib/feedTypes"
import MediaLightbox from "./MediaLightbox"

export default function FeedPostMediaStrip({ media }: { media?: FeedMedia[] }) {
  const items = useMemo(() => (Array.isArray(media) ? media : []), [media])
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  if (items.length === 0) return null

  const openAt = (i: number) => {
    setIndex(i)
    setOpen(true)
  }

  return (
    <div
      className="mt-3"
      // don’t preventDefault here; let scrolling work
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="
          flex gap-3 overflow-x-auto pb-2
          [-ms-overflow-style:none] [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          snap-x snap-mandatory
        "
      >
        {items.map((m, i) => (
          <button
            key={m._id}
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openAt(i)
            }}
            className="
              relative shrink-0 snap-start
              h-44 w-72 sm:h-52 sm:w-80
              rounded-lg overflow-hidden
              border border-(--dk-ink)/10
              bg-(--dk-mist)
              focus:outline-none focus:ring-2 focus:ring-(--dk-sky)/60
              cursor-pointer
            "
            aria-label="Open media"
          >
            {m.type === "video" ? (
              <video
                className="h-full w-full object-cover"
                src={m.url}
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <Image
                src={m.url}
                alt={m.title || "Post media"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 288px, 320px"
              />
            )}

            {m.type === "video" ? (
              <div className="absolute inset-0 bg-black/15" />
            ) : null}
          </button>
        ))}
      </div>

      <MediaLightbox
        open={open}
        media={items}
        index={index}
        onClose={() => setOpen(false)}
        onChangeIndex={(next) => setIndex(next)}
      />
    </div>
  )
}
