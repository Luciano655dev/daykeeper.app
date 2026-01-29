"use client"

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import SearchBar from "@/components/Search/SearchBar"
import SearchTypePills from "@/components/Search/SearchTypePills"
import SearchFiltersRow from "@/components/Search/SearchFiltersRow"
import SearchResultsList from "@/components/Search/SearchResultsList"
import SearchResultsSkeleton from "@/components/Search/SearchResultsSkeleton"
import {
  useSearch,
  type SearchType,
  type SearchOrder,
  type FollowingScope,
} from "@/hooks/useSearch"

function cleanStr(v: string | null) {
  return (v || "").trim()
}

function SearchPageInner() {
  const router = useRouter()
  const sp = useSearchParams()

  const type = ((sp.get("type") as SearchType) || "Post") as SearchType
  const order = ((sp.get("order") as SearchOrder) || "recent") as SearchOrder
  const q = cleanStr(sp.get("q"))

  const followingParam = cleanStr(sp.get("following"))
  const following: FollowingScope | undefined =
    followingParam === "friends" ||
    followingParam === "following" ||
    followingParam === "followers"
      ? (followingParam as FollowingScope)
      : undefined

  const [input, setInput] = useState(q)
  const debounceRef = useRef<any>(null)

  useEffect(() => setInput(q), [q])

  const setParam = useCallback(
    (next: Record<string, string | number | null | undefined>) => {
      const nextSp = new URLSearchParams(sp.toString())
      for (const [k, v] of Object.entries(next)) {
        if (v === null || v === undefined || String(v).trim() === "")
          nextSp.delete(k)
        else nextSp.set(k, String(v))
      }
      router.push(`/search?${nextSp.toString()}`)
    },
    [router, sp],
  )

  const onChangeInput = useCallback(
    (v: string) => {
      setInput(v)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        setParam({ q: v.trim() ? v.trim() : null })
      }, 250)
    },
    [setParam],
  )

  const search = useSearch({
    q,
    type,
    order,
    following,
    pageSize: 10, // FIXED: user can't change page size
  })

  const subtitle = useMemo(() => {
    const scope = following ? `Scope: ${following}` : "All results"
    return `${scope} • ${type} • ${order}`
  }, [following, type, order])

  return (
    <main className="pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto border-x border-(--dk-ink)/10 bg-(--dk-paper) min-h-screen">
        <div className="sticky top-0 bg-(--dk-paper)/95 backdrop-blur-md z-20">
          <div className="h-1 w-full bg-(--dk-sky)/70" />
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-(--dk-mist) transition"
              aria-label="Back"
            >
              <ArrowLeft size={18} className="text-(--dk-ink)" />
            </button>

            <div className="leading-tight">
              <div className="text-sm font-semibold text-(--dk-ink)">
                Search
              </div>
              <div className="text-xs text-(--dk-slate)">{subtitle}</div>
            </div>
          </div>

          <div className="px-4 pb-3">
            <SearchBar
              value={input}
              onChange={onChangeInput}
              loading={search.loading || search.loadingMore}
            />
          </div>

          <div className="px-4 pb-3 flex flex-col gap-2">
            <SearchTypePills
              value={type}
              onChange={(t) => setParam({ type: t })}
            />
            <SearchFiltersRow
              order={order}
              onOrderChange={(v) => setParam({ order: v })}
              following={following}
              onFollowingChange={(v) => setParam({ following: v || null })}
            />
          </div>

          <div className="px-4 pb-3 text-center">
            <div className="rounded-2xl border border-(--dk-sky)/30 bg-(--dk-sky)/10 px-3 py-2 text-xs text-(--dk-ink)">
              Tip: use <span className="font-semibold">friends</span> to search
              only your circle.
            </div>
          </div>
        </div>

        {search.loadingFirst ? <SearchResultsSkeleton /> : null}

        {!search.loadingFirst && search.error ? (
          <div className="px-4 py-6 text-sm text-red-500">{search.error}</div>
        ) : null}

        {!search.loadingFirst && !search.error && !search.data.length ? (
          <div className="px-4 py-5">
            <div className="rounded-2xl border border-(--dk-ink)/10 bg-(--dk-paper) p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-(--dk-mist) flex items-center justify-center text-(--dk-sky)">
                  <ArrowLeft size={18} className="rotate-180" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-(--dk-ink)">
                    No results found
                  </div>
                  <div className="text-xs text-(--dk-slate) mt-1">
                    Try a different keyword or adjust filters.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {!!search.data.length ? (
          <SearchResultsList
            items={search.data}
            type={type}
            hasMore={search.hasMore}
            loadingMore={search.loadingMore}
            onLoadMore={search.loadMore}
          />
        ) : null}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="pb-20 lg:pb-0">
          <div className="max-w-2xl mx-auto border-x border-(--dk-ink)/10 bg-(--dk-paper) min-h-screen">
            <div className="px-4 py-6 text-sm text-(--dk-slate)">Loading…</div>
          </div>
        </main>
      }
    >
      <SearchPageInner />
    </Suspense>
  )
}
