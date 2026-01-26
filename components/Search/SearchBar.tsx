"use client"

import { Loader2, Search } from "lucide-react"

export default function SearchBar({
  value,
  onChange,
  loading,
}: {
  value: string
  onChange: (v: string) => void
  loading?: boolean
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-(--dk-ink)/10 bg-(--dk-mist) px-3 py-2">
      <Search size={16} className="text-(--dk-slate)" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search…"
        className="w-full bg-transparent text-sm text-(--dk-ink) outline-none placeholder:text-(--dk-slate)"
      />
      {loading ? (
        <Loader2 size={16} className="animate-spin text-(--dk-slate)" />
      ) : null}
    </div>
  )
}
