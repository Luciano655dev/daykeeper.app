"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import type { SearchType } from "@/hooks/useSearch"
import {
  getAvatar,
  getHref,
  getSubtitle,
  getTitle,
  pickThumb,
} from "./searchUtils"

export default function SearchResultRow({
  item,
  type,
}: {
  item: any
  type: SearchType
}) {
  const router = useRouter()
  const title = getTitle(item, type)
  const subtitle = getSubtitle(item, type)
  const avatar = getAvatar(item, type)
  const thumb = type === "User" ? null : pickThumb(item)
  const href = getHref(item, type)

  return (
    <button
      onClick={() => {
        if (href) router.push(href)
      }}
      className={[
        "w-full text-left rounded-2xl border border-(--dk-ink)/10 bg-(--dk-paper) transition p-3",
        "hover:bg-(--dk-mist)",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-(--dk-ink)/10 bg-(--dk-mist)">
          <Image src={avatar} alt="" fill className="object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-semibold text-(--dk-ink)">
              {title}
            </div>

            {typeof item?.relevance === "number" ? (
              <div className="shrink-0 rounded-full border border-(--dk-sky)/40 bg-(--dk-sky)/15 px-2 py-0.5 text-[11px] text-(--dk-ink)">
                rel {item.relevance}
              </div>
            ) : null}
          </div>

          <div className="mt-0.5 line-clamp-2 text-xs text-(--dk-slate)">
            {subtitle}
          </div>

          {type !== "User" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-(--dk-slate)">
              {typeof item?.likes === "number" ? (
                <span className="rounded-full border border-(--dk-ink)/10 bg-(--dk-mist) px-2 py-0.5">
                  {item.likes} likes
                </span>
              ) : null}
              {typeof item?.comments === "number" ? (
                <span className="rounded-full border border-(--dk-ink)/10 bg-(--dk-mist) px-2 py-0.5">
                  {item.comments} comments
                </span>
              ) : null}
              {typeof item?.userLiked === "boolean" ? (
                <span className="rounded-full border border-(--dk-ink)/10 bg-(--dk-mist) px-2 py-0.5">
                  {item.userLiked ? "liked" : "not liked"}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {thumb ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-(--dk-ink)/10 bg-(--dk-mist)">
            <Image src={thumb} alt="" fill className="object-cover" />
          </div>
        ) : null}
      </div>
    </button>
  )
}
