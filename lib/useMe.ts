"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/authClient"

type Me = {
  _id: string
  username: string
}

export function useMe() {
  const [me, setMe] = useState<Me | null>(null)

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        const res = await apiFetch("http://localhost:3001/auth/user")
        if (!res.ok) return
        const data = await res.json()
        if (alive) setMe(data?.user ?? null)
      } catch {}
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  return me
}
