"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Search,
  Bell,
  Mail,
  PlusSquare,
  User,
  Bookmark,
  Settings,
} from "lucide-react"

import { useMe } from "@/lib/useMe"

const NAV: any = [
  { label: "Feed", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { label: "Settings", href: "/settings", icon: Settings },
]

export default function SidebarNav() {
  const pathname = usePathname()
  const me = useMe()

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 xl:w-72 border-r border-(--dk-ink)/10 bg-(--dk-paper) flex-col">
      <div className="flex-1 overflow-y-auto">
        {/* Brand */}
        <Link
          href="/"
          className="px-6 py-5 border-b border-(--dk-ink)/10 flex items-center gap-3 hover:bg-[color-mix(in_srgb,var(--dk-mist)_40%,transparent)]"
        >
          <Image
            src="/logo-main.svg"
            alt="Daykeeper"
            width={22}
            height={22}
            priority
          />
          <span className="text-xl font-bold text-(--dk-ink)">Daykeeper</span>
        </Link>

        {/* Nav */}
        <nav className="px-3 py-4 space-y-1">
          {NAV.map((item: any) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition",
                  active
                    ? "text-(--dk-sky) bg-(--dk-mist)"
                    : "text-(--dk-slate) hover:text-(--dk-ink) hover:bg-[color-mix(in_srgb,var(--dk-mist)_70%,transparent)]",
                ].join(" ")}
              >
                <Icon size={22} strokeWidth={active ? 2.6 : 2} />
                <span className={active ? "font-bold" : "font-medium"}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {me &&
            (() => {
              const profileHref = `/${me.username}`
              const isActive =
                pathname === profileHref ||
                pathname.startsWith(profileHref + "/")

              return (
                <Link
                  href={profileHref}
                  className={[
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition",
                    isActive
                      ? "text-(--dk-sky) bg-(--dk-mist)"
                      : "text-(--dk-slate) hover:text-(--dk-ink) hover:bg-[color-mix(in_srgb,var(--dk-mist)_70%,transparent)]",
                  ].join(" ")}
                >
                  <User size={22} strokeWidth={isActive ? 2.6 : 2} />
                  <span className={isActive ? "font-bold" : "font-medium"}>
                    Profile
                  </span>
                </Link>
              )
            })()}
        </nav>

        {/* Create button */}
        <div className="px-3 py-2">
          <Link
            href="/create"
            className="w-full bg-(--dk-sky) text-white py-3.5 rounded-xl flex justify-center gap-2"
          >
            <PlusSquare size={20} />
            Create
          </Link>
        </div>
      </div>
    </aside>
  )
}
