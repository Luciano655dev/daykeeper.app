"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"
import FormAlert from "@/components/Form/FormAlert"
import PrivacyPicker, {
  type PrivacyValue,
} from "@/components/common/PrivacyPicker"
import { toDDMMYYYY } from "@/lib/date"

type Privacy = PrivacyValue

type ApiOk<T> = { message?: string; data?: T }

function safeApiMessage(err: any) {
  try {
    const parsed = JSON.parse(err?.message)
    const msg = parsed?.message

    if (typeof msg === "string") return msg

    if (msg && typeof msg === "object") {
      if (typeof msg.message === "string") return msg.message
      return JSON.stringify(msg)
    }

    return "Something went wrong."
  } catch {
    return err?.message ? String(err.message) : "Something went wrong."
  }
}

async function readJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T
  } catch {
    return null
  }
}

function combineDateTime(date: string, time: string) {
  if (!date) return ""
  const t = time?.trim() ? time.trim() : "00:00"
  const d = new Date(`${date}T${t}:00`)
  return d.toISOString()
}

function todayInputs(fromDate?: string | null) {
  if (fromDate && /^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
    return { date: fromDate, time: "00:00" }
  }
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const hh = String(now.getHours()).padStart(2, "0")
  const min = String(now.getMinutes()).padStart(2, "0")
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` }
}

function CreateNoteForm() {
  const router = useRouter()
  const sp = useSearchParams()
  const qc = useQueryClient()

  const goToTodayFeed = () =>
    router.replace(`/?date=${encodeURIComponent(toDDMMYYYY(new Date()))}`)

  const [text, setText] = useState("")
  const [privacy, setPrivacy] = useState<Privacy>("public")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const next = todayInputs(sp.get("date"))
    setDate(next.date)
    setTime(next.time)
  }, [sp])

  const canSave = useMemo(() => {
    if (busy) return false
    if (!text.trim()) return false
    if (!date) return false
    return true
  }, [text, date, busy])

  async function onSave() {
    if (!canSave) return
    if (busy) return

    setBusy(true)
    setFormError(null)

    try {
      const payload = {
        text: text.trim(),
        privacy,
        date: combineDateTime(date, time),
      }

      const res = await apiFetch(`${API_URL}/day/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      })

      const data = await readJsonSafe<ApiOk<any>>(res)

      if (!res.ok) {
        const msg = data?.message || "Could not create note."
        throw new Error(JSON.stringify({ message: msg }))
      }

      qc.invalidateQueries({ queryKey: ["userDay"] })
      goToTodayFeed()
    } catch (err: any) {
      setFormError(String(safeApiMessage(err)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="pb-20 lg:pb-0">
      <div className="mx-auto min-h-screen max-w-3xl bg-(--dk-paper) lg:border-x lg:border-(--dk-ink)/10">
        <div className="sticky top-0 z-10 border-b border-(--dk-ink)/10 bg-(--dk-paper)/96 backdrop-blur-md">
          <div className="h-0.5 w-full bg-(--dk-sky)/65" />
          <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-2 transition hover:bg-(--dk-mist)/75"
              aria-label="Back"
              disabled={busy}
            >
              <ArrowLeft size={18} className="text-(--dk-ink)" />
            </button>

            <div className="leading-tight">
              <div className="text-sm font-semibold text-(--dk-ink)">
                Create note
              </div>
              <div className="text-xs text-(--dk-slate)">
                Capture a thought
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-5">
          {formError ? <FormAlert type="error">{formError}</FormAlert> : null}

          <div className="space-y-2">
            <div className="text-xs font-medium text-(--dk-slate)">Note</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Write your note…"
              className={[
                "w-full rounded-lg border border-transparent bg-(--dk-mist)/45",
                "px-3 py-2 text-sm text-(--dk-ink)",
                "focus:outline-none focus:ring-2 focus:ring-(--dk-sky)/30",
              ].join(" ")}
            />
            <div className="text-xs text-(--dk-slate)">
              {text.trim().length} characters
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-(--dk-slate)">Date</div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 w-full rounded-lg border border-transparent bg-(--dk-mist)/45 px-3 py-2 text-sm text-(--dk-ink)"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-(--dk-slate)">Time</div>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-2 w-full rounded-lg border border-transparent bg-(--dk-mist)/45 px-3 py-2 text-sm text-(--dk-ink)"
              />
            </div>
          </div>

          <PrivacyPicker value={privacy} onChange={setPrivacy} />

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={busy}
              className="rounded-lg bg-(--dk-mist)/55 px-3 py-2 text-sm transition hover:bg-(--dk-mist)/80 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={!canSave}
              className="rounded-lg bg-(--dk-sky) px-3 py-2 text-sm text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {busy ? "Saving..." : "Create note"}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CreateNotePage() {
  return (
    <Suspense
      fallback={
        <main className="pb-20 lg:pb-0">
          <div className="mx-auto min-h-screen max-w-3xl bg-(--dk-paper) lg:border-x lg:border-(--dk-ink)/10">
            <div className="px-4 py-6 text-sm text-(--dk-slate)">Loading…</div>
          </div>
        </main>
      }
    >
      <CreateNoteForm />
    </Suspense>
  )
}
