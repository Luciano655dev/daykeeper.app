"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, PlusSquare, Bell, User } from "lucide-react"

import { useMe } from "@/lib/useMe"

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

export default function MobileNav() {
  const pathname = usePathname()
  const me = useMe()

  const NAV = [
    { href: "/", icon: Home },
    { href: "/search", icon: Search },
    { href: "/create", icon: PlusSquare, isCreate: true },
    { href: "/notifications", icon: Bell },
    ...(me ? [{ href: `/${me.username}`, icon: User, isProfile: true }] : []),
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-(--dk-paper) border-t border-(--dk-ink)/10 z-20">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex items-center justify-center p-3 rounded-xl transition-all",
                active
                  ? "text-(--dk-sky)"
                  : "text-(--dk-slate) hover:text-(--dk-ink)",
              ].join(" ")}
            >
              <Icon
                size={24}
                className={active ? "stroke-[2.4]" : "stroke-2"}
                {...(active && !item.isCreate ? { fill: "currentColor" } : {})}
              />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
