"use client"

import Image from "next/image"
import { useState } from "react"
import { ImagePlus, UploadCloud, Plus, X } from "lucide-react"
import { useObjectUrlPreviews } from "@/components/Post/Create/UseObjectUrlPreviews"

type ExistingMedia = {
  _id: string
  url: string
  type: "image" | "video"
}

type Preview = {
  file: File
  url: string
  kind: "video" | "image"
}

export default function EditMediaDropzone({
  keptExisting,
  keepMediaIds,
  newFiles,
  maxMedia,
  onPick,
  onAddNewFiles,
  onRemoveExisting,
  onRemoveNewFile,
}: {
  keptExisting: ExistingMedia[]
  keepMediaIds: Set<string>
  newFiles: File[]
  maxMedia: number
  onPick: () => void
  onAddNewFiles: (files: File[]) => void
  onRemoveExisting: (mediaId: string) => void
  onRemoveNewFile: (index: number) => void
}) {
  const [dragOver, setDragOver] = useState(false)

  const newPreviews = useObjectUrlPreviews(newFiles)
  const total = keepMediaIds.size + newFiles.length
  const canAddMore = total < maxMedia

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)

    const incoming = Array.from(e.dataTransfer.files || [])
    onAddNewFiles(incoming)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-(--dk-ink)">
            Media ({total}/{maxMedia})
          </div>
          <div className="text-xs text-(--dk-slate)">
            Click or drag files here. Remove any you don’t want to keep.
          </div>
        </div>

        <button
          type="button"
          onClick={onPick}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper) px-3 py-2 text-sm text-(--dk-sky) hover:underline"
          disabled={!canAddMore}
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (canAddMore) onPick()
        }}
        onKeyDown={(e) => {
          if (!canAddMore) return
          if (e.key === "Enter" || e.key === " ") onPick()
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!canAddMore) return
          setDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!canAddMore) return
          setDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(false)
        }}
        onDrop={(e) => {
          if (!canAddMore) return
          onDrop(e)
        }}
        className={[
          "rounded-2xl border border-(--dk-ink)/10 bg-(--dk-paper) overflow-hidden transition",
          dragOver ? "ring-2 ring-(--dk-sky)/60" : "",
          !canAddMore ? "opacity-95" : "",
        ].join(" ")}
      >
        {total === 0 ? (
          <EmptyState dragOver={dragOver} maxMedia={maxMedia} />
        ) : (
          <GridState
            keptExisting={keptExisting}
            newPreviews={newPreviews}
            canAddMore={canAddMore}
            onPick={onPick}
            onRemoveExisting={onRemoveExisting}
            onRemoveNewFile={onRemoveNewFile}
          />
        )}
      </div>
    </div>
  )
}

function EmptyState({
  dragOver,
  maxMedia,
}: {
  dragOver: boolean
  maxMedia: number
}) {
  return (
    <div className="p-6 sm:p-10">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl border border-(--dk-ink)/10 bg-(--dk-sky)/10 flex items-center justify-center">
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
          Click anywhere here, or drag files in. Up to {maxMedia}.
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper) px-3 py-2 text-sm text-(--dk-sky)">
          <Plus size={16} />
          Choose files
        </div>
      </div>
    </div>
  )
}

function GridState({
  keptExisting,
  newPreviews,
  canAddMore,
  onPick,
  onRemoveExisting,
  onRemoveNewFile,
}: {
  keptExisting: ExistingMedia[]
  newPreviews: Preview[]
  canAddMore: boolean
  onPick: () => void
  onRemoveExisting: (id: string) => void
  onRemoveNewFile: (index: number) => void
}) {
  return (
    <div className="p-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* existing kept */}
        {keptExisting.map((m) => (
          <div
            key={m._id}
            className="relative overflow-hidden rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper)"
          >
            <div className="aspect-square">
              {m.type === "video" ? (
                <video
                  src={m.url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <Image
                  src={m.url}
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
                onRemoveExisting(m._id)
              }}
              className="absolute top-2 right-2 inline-flex items-center justify-center rounded-lg border border-(--dk-ink)/10 bg-(--dk-paper)/90 p-1 text-(--dk-ink)"
              aria-label="Remove existing media"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {/* new files */}
        {newPreviews.map((p, idx) => (
          <div
            key={p.url}
            className="relative overflow-hidden rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper)"
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
                onRemoveNewFile(idx)
              }}
              className="absolute top-2 right-2 inline-flex items-center justify-center rounded-lg border border-(--dk-ink)/10 bg-(--dk-paper)/90 p-1 text-(--dk-ink)"
              aria-label="Remove new file"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {/* add tile */}
        {canAddMore ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onPick()
            }}
            className={[
              "aspect-square rounded-xl border border-dashed border-(--dk-ink)/20",
              "bg-(--dk-paper) hover:bg-(--dk-ink)/3 transition",
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
