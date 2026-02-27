// components/PostCreate/MediaDropzone.tsx
"use client"

import Image from "next/image"
import { useState } from "react"
import { ImagePlus, UploadCloud, Plus, X } from "lucide-react"
import { useObjectUrlPreviews } from "./UseObjectUrlPreviews"

type Preview = {
  file: File
  url: string
  kind: "video" | "image"
}

export default function MediaDropzone({
  files,
  maxFiles,
  onPick,
  onAddFiles,
  onRemoveFile,
}: {
  files: File[]
  maxFiles: number
  onPick: () => void
  onAddFiles: (files: File[]) => void
  onRemoveFile: (index: number) => void
}) {
  const [dragOver, setDragOver] = useState(false)

  const previews = useObjectUrlPreviews(files)

  const canAddMore = files.length < maxFiles

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)

    const incoming = Array.from(e.dataTransfer.files || [])
    onAddFiles(incoming)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-(--dk-ink)">
            Media ({files.length}/{maxFiles})
          </div>
          <div className="text-xs text-(--dk-slate)">
            Drag and drop or click to upload images/videos.
          </div>
        </div>

        <button
          type="button"
          onClick={onPick}
          className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-(--dk-mist)/55 px-3 py-2 text-sm text-(--dk-sky)"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={onPick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onPick()
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(false)
        }}
        onDrop={onDrop}
        className={[
          "overflow-hidden rounded-xl bg-(--dk-mist)/30 transition",
          dragOver ? "ring-2 ring-(--dk-sky)/60" : "",
        ].join(" ")}
      >
        {files.length === 0 ? (
          <EmptyState dragOver={dragOver} maxFiles={maxFiles} />
        ) : (
          <GridState
            previews={previews}
            canAddMore={canAddMore}
            onPick={onPick}
            onRemoveFile={onRemoveFile}
          />
        )}
      </div>
    </div>
  )
}

function EmptyState({
  dragOver,
  maxFiles,
}: {
  dragOver: boolean
  maxFiles: number
}) {
  return (
    <div className="p-6 sm:p-10">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-(--dk-sky)/10">
          {dragOver ? (
            <UploadCloud size={22} className="text-(--dk-sky)" />
          ) : (
            <ImagePlus size={22} className="text-(--dk-sky)" />
          )}
        </div>

        <div className="mt-3 text-sm font-medium text-(--dk-ink)">
          {dragOver ? "Drop files to upload" : "Add photos or videos"}
        </div>
        <div className="mt-1 text-xs text-(--dk-slate)">
          Click anywhere here, or drag files in. Up to {maxFiles}.
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-(--dk-paper)/75 px-3 py-2 text-sm text-(--dk-sky)">
          <Plus size={16} />
          Choose files
        </div>
      </div>
    </div>
  )
}

function GridState({
  previews,
  canAddMore,
  onPick,
  onRemoveFile,
}: {
  previews: Preview[]
  canAddMore: boolean
  onPick: () => void
  onRemoveFile: (index: number) => void
}) {
  return (
    <div className="p-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {previews.map((p, idx) => (
          <div
            key={p.url}
            className="relative overflow-hidden rounded-lg bg-(--dk-paper)/80"
          >
            <div className="aspect-square">
              {p.kind === "video" ? (
                <video
                  src={p.url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <Image
                  src={p.url}
                  alt=""
                  width={512}
                  height={512}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onRemoveFile(idx)
              }}
              className="absolute top-2 right-2 inline-flex items-center justify-center rounded-lg border border-(--dk-ink)/10 bg-(--dk-paper)/90 p-1 text-(--dk-ink)"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {canAddMore ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onPick()
            }}
            className={[
              "aspect-square rounded-lg",
              "bg-(--dk-paper)/70 hover:bg-(--dk-mist)/60 transition",
              "flex flex-col items-center justify-center gap-2 text-(--dk-slate)",
            ].join(" ")}
          >
            <Plus size={20} className="text-(--dk-sky)" />
            <span className="text-xs font-medium text-(--dk-sky)">
              Add more
            </span>
          </button>
        ) : null}
      </div>

      <div className="mt-2 text-xs text-(--dk-slate) px-1">
        Tip: you can drag more files here.
      </div>
    </div>
  )
}
