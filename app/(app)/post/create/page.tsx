// app/(app)/post/create/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { ArrowLeft } from "lucide-react"

import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"
import RichTextarea from "@/components/common/RichTextarea"
import FormButton from "@/components/Form/FormButton"
import MediaDropzone from "@/components/Post/Create/MediaDropzone"
import PrivacyPicker, {
  type PrivacyValue,
} from "@/components/common/PrivacyPicker"
import { useUploadQueue } from "@/lib/uploadQueue"

const MAX_FILES = 5

export default function CreatePostPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { enqueuePostUpload } = useUploadQueue()

  const [data, setData] = useState("")
  const [privacy, setPrivacy] = useState<PrivacyValue>("public")
  const [files, setFiles] = useState<File[]>([])

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const trimmedData = data.trim()

  function openPicker() {
    fileInputRef.current?.click()
  }

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files || [])
    e.target.value = ""
    if (!list.length) return
    setError(null)

    const room = MAX_FILES - files.length
    if (room <= 0) {
      setError(`You can only upload up to ${MAX_FILES} files.`)
      return
    }

    setFiles((prev) => [...prev, ...list.slice(0, room)])
  }

  function addFiles(incoming: File[]) {
    if (!incoming.length) return
    setError(null)

    const room = MAX_FILES - files.length
    if (room <= 0) {
      setError(`You can only upload up to ${MAX_FILES} files.`)
      return
    }

    setFiles((prev) => [...prev, ...incoming.slice(0, room)])
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function submit() {
    if (busy) return
    setBusy(true)
    setError(null)

    try {
      if (!trimmedData) throw new Error("Post text is required.")
      if (files.length > MAX_FILES) {
        throw new Error(`You can only upload up to ${MAX_FILES} files.`)
      }

      if (files.length > 0) {
        enqueuePostUpload({ data, privacy, files })
        router.back()
        return
      }

      const fd = new FormData()
      fd.append("data", trimmedData)
      fd.append("privacy", privacy)
      for (const f of files) fd.append("files", f)

      const res = await apiFetch(`${API_URL}/post/create`, {
        method: "POST",
        body: fd,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Request failed (${res.status})`)
      }

      router.back()
    } catch (err: any) {
      setError(err?.message || "Something went wrong.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto border-x border-(--dk-ink)/10 bg-(--dk-paper) min-h-screen">
        {/* top bar */}
        <div className="sticky top-0 bg-(--dk-paper)/95 backdrop-blur-md z-10">
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
                Create post
              </div>
              <div className="text-xs text-(--dk-slate)">
                Text, media, privacy
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-5">
          {error ? (
            <div className="rounded-xl border border-(--dk-ink)/10 bg-(--dk-paper) p-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          {/* hidden input lives at page level */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={onFilesSelected}
          />

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-(--dk-ink)">Post</label>
              <div className="text-xs text-(--dk-slate)">
                {data.length}/1000
              </div>
            </div>
            <div className="mt-2">
              <RichTextarea
                value={data}
                onChange={(value) => {
                  setData(value)
                  if (error && value.trim()) setError(null)
                }}
                placeholder="What happened today?"
                rows={4}
                maxLength={1000}
                showCount={false}
                renderPreview={false}
              />
            </div>
          </div>

          <MediaDropzone
            files={files}
            maxFiles={MAX_FILES}
            onPick={openPicker}
            onAddFiles={addFiles}
            onRemoveFile={removeFile}
          />

          <PrivacyPicker value={privacy} onChange={setPrivacy} />

          <FormButton
            type="button"
            onClick={submit}
            disabled={busy || files.length > MAX_FILES || !trimmedData}
          >
            {busy ? "Posting..." : "Create post"}
          </FormButton>
        </div>
      </div>
    </main>
  )
}
