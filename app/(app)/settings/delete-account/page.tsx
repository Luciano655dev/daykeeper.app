"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Ban } from "lucide-react"

import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"
import FormAlert from "@/components/Form/FormAlert"

export default function DeleteAccountPage() {
  const router = useRouter()

  const [deleteCode, setDeleteCode] = useState("")
  const [deletePassword, setDeletePassword] = useState("")
  const [requesting, setRequesting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canDelete = useMemo(() => {
    const codeOk = /^\d{6}$/.test(deleteCode.trim())
    return codeOk && deletePassword.trim().length > 0
  }, [deleteCode, deletePassword])

  async function onRequestDeleteCode() {
    if (requesting || deleting) return
    setRequesting(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await apiFetch(`${API_URL}/auth/request_delete_code`, {
        method: "POST",
        cache: "no-store",
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || "Failed to send deletion code")
      }

      setSuccess("Deletion code sent to your email.")
    } catch (e: any) {
      setError(e?.message || "Failed to send deletion code")
    } finally {
      setRequesting(false)
    }
  }

  async function onDeleteAccount() {
    if (!canDelete || deleting) return
    setDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await apiFetch(`${API_URL}/user`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          code: deleteCode.trim(),
        }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || "Failed to delete account")
      }

      setSuccess("Account deleted. Redirecting to login...")
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (e: any) {
      setError(e?.message || "Failed to delete account")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto border-x border-(--dk-ink)/10 bg-(--dk-paper) min-h-screen">
        <div className="sticky top-0 bg-(--dk-paper)/95 backdrop-blur-md z-20">
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
                Delete account
              </div>
              <div className="text-xs text-(--dk-slate)">
                This action is permanent.
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div className="rounded-2xl border border-(--dk-ink)/10 bg-(--dk-paper) p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-(--dk-error)/15 text-(--dk-error) flex items-center justify-center">
                <Ban size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-(--dk-ink)">
                  Are you sure?
                </div>
                <div className="text-xs text-(--dk-slate)">
                  Deleting your account removes your posts, comments, tasks,
                  notes, events, and connections. This cannot be undone.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={onRequestDeleteCode}
              disabled={requesting || deleting}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed border border-(--dk-ink)/10 bg-(--dk-paper) hover:bg-(--dk-mist)"
            >
              {requesting ? "Sending code..." : "Send deletion code"}
            </button>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={deleteCode}
                onChange={(e) => setDeleteCode(e.target.value)}
                placeholder="6 digit code"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition bg-(--dk-paper) border-(--dk-ink)/10 focus:border-(--dk-sky) text-(--dk-ink)"
              />
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition bg-(--dk-paper) border-(--dk-ink)/10 focus:border-(--dk-sky) text-(--dk-ink)"
              />
            </div>

            <button
              type="button"
              onClick={onDeleteAccount}
              disabled={!canDelete || deleting}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background:
                  "color-mix(in srgb, var(--dk-error) 18%, var(--dk-paper))",
                color: "var(--dk-error)",
                border:
                  "1px solid color-mix(in srgb, var(--dk-error) 35%, transparent)",
              }}
            >
              {deleting ? "Deleting..." : "Delete account"}
            </button>

            {error ? <FormAlert>{error}</FormAlert> : null}
            {success ? <FormAlert type="success">{success}</FormAlert> : null}
          </div>
        </div>
      </div>
    </main>
  )
}
