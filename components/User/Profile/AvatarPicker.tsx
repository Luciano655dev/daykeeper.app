"use client"

import Image from "next/image"
import { Camera, Trash2, Undo2 } from "lucide-react"

export default function AvatarPicker({
  fileRef,
  avatarSrc,
  avatarResetQueued,
  avatarFile,
  onPick,
  onChange,
  onReset,
  onUndo,
}: {
  fileRef: React.RefObject<HTMLInputElement | null>
  avatarSrc: string
  avatarResetQueued: boolean
  avatarFile: File | null
  onPick: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
  onUndo: () => void
}) {
  return (
    <section className="w-full">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-full flex justify-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-(--dk-mist)/45 ring-1 ring-(--dk-ink)/10 sm:h-36 sm:w-36">
            <Image
              src={avatarSrc}
              alt="Profile picture"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 208px"
              priority
            />
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-2">
          <button
            type="button"
            onClick={onPick}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-(--dk-mist)/55 px-4 text-sm font-medium text-(--dk-ink) transition hover:bg-(--dk-mist)/80"
          >
            <Camera size={18} />
            Choose
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-(--dk-mist)/55 px-4 text-sm font-medium text-(--dk-ink)/80 transition hover:bg-(--dk-mist)/80"
          >
            <Trash2 size={18} />
            Reset
          </button>

          {(avatarFile || avatarResetQueued) && (
            <button
              type="button"
              onClick={onUndo}
              className="col-span-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-(--dk-mist)/55 px-4 text-sm font-medium text-(--dk-ink)/80 transition hover:bg-(--dk-mist)/80 sm:col-auto sm:w-auto"
            >
              <Undo2 size={18} />
              Undo
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onChange}
            className="hidden"
          />
        </div>

        <div className="text-[11px] text-(--dk-slate)">
          PNG or JPG. Max 8MB.
        </div>
      </div>
    </section>
  )
}
