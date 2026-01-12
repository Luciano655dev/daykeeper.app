"use client"

import { useEffect, useState } from "react"
import { Flag } from "lucide-react"
import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"

type Props = {
  name: string
  open: boolean
  onClose: () => void
}

function safeApiMessage(err: any) {
  try {
    return JSON.parse(err?.message).message || "Something went wrong."
  } catch {
    return "Something went wrong."
  }
}

export default function ReportUserModal({ name, open, onClose }: Props) {
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setReason("")
    setError(null)
    setBusy(false)
  }, [open])

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
      }
    }
    if (open) document.addEventListener("keydown", onEsc)
    return () => document.removeEventListener("keydown", onEsc)
  }, [open, onClose])

  async function submit() {
    if (busy) return
    setBusy(true)
    setError(null)

    try {
      const res = await apiFetch(
        `${API_URL}/${encodeURIComponent(name)}/report`,
        {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: reason.trim() }),
        }
      )

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(
          text || JSON.stringify({ message: `Request failed (${res.status})` })
        )
      }

      onClose()
      setSuccessOpen(true)
    } catch (err: any) {
      setError(safeApiMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (!open && !successOpen) return null

  return (
    <>
      {/* REPORT MODAL */}
      {open ? (
        <div className="fixed inset-0 z-50" onClick={onClose}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 min-h-full flex items-center justify-center p-4">
            <div
              className="w-full max-w-md rounded-2xl bg-(--dk-paper) border border-(--dk-ink)/10 shadow-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Flag size={18} className="text-(--dk-sky)" />
                  <h2 className="text-(--dk-ink) font-semibold">Report user</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-2 py-1 rounded-lg hover:bg-(--dk-ink)/5 text-(--dk-slate) hover:text-(--dk-ink) transition"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-(--dk-slate) mb-3">
                Reporting{" "}
                <span className="font-medium text-(--dk-ink)">@{name}</span>.
                Reason (optional):
              </p>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional reason..."
                rows={4}
                className="w-full rounded-xl border border-(--dk-ink)/15 bg-(--dk-paper) px-3 py-2 text-(--dk-ink) text-sm outline-none focus:border-(--dk-sky)/60"
              />

              {error ? (
                <div className="mt-2 text-sm text-red-600">{error}</div>
              ) : null}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  className="px-3 py-2 rounded-xl border border-(--dk-ink)/10 hover:bg-(--dk-ink)/5 text-sm transition disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={submit}
                  disabled={busy}
                  className="px-3 py-2 rounded-xl bg-(--dk-sky) text-white text-sm hover:opacity-95 transition disabled:opacity-60"
                >
                  {busy ? "Sending..." : "Submit report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* SUCCESS MODAL */}
      {successOpen ? (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setSuccessOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 min-h-full flex items-center justify-center p-4">
            <div
              className="w-full max-w-sm rounded-2xl bg-(--dk-paper) border border-(--dk-ink)/10 shadow-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-2">
                <Flag size={18} className="text-(--dk-sky)" />
                <h2 className="text-(--dk-ink) font-semibold">
                  Report submitted
                </h2>
              </div>

              <p className="text-sm text-(--dk-slate)">
                Report submitted successfully. Thanks for helping keep DayKeeper
                safe.
              </p>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSuccessOpen(false)}
                  className="px-3 py-2 rounded-xl bg-(--dk-sky) text-white text-sm hover:opacity-95 transition"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
