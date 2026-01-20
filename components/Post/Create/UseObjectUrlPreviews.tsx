"use client"

import { useEffect, useMemo } from "react"

type Preview = {
  file: File
  url: string
  kind: "video" | "image"
}

export function useObjectUrlPreviews(files: File[]): Preview[] {
  const previews: any = useMemo(() => {
    return files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      kind: f.type.startsWith("video") ? "video" : "image",
    }))
  }, [files])

  useEffect(() => {
    return () => {
      previews.forEach((p: any) => URL.revokeObjectURL(p.url))
    }
  }, [previews])

  return previews
}
