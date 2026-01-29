"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Ban, MailCheck } from "lucide-react"

import { apiFetch } from "@/lib/authClient"
import { API_URL } from "@/config"
import FormAlert from "@/components/Form/FormAlert"

type ApiError = { message?: string; reason?: string }

function parseApiMessage(payload: ApiError | null, fallback: string) {
  if (!payload) return fallback
  if (payload.message) return payload.message
  return fallback
}

export default function DeleteAccountPage() {
  const router = useRouter()

  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [requesting, setRequesting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [codeSent, setCodeSent] = useState(false)

  const canDelete = useMemo(() => {
    const codeOk = /^\d{6}$/.test(code.trim())
    const passOk = password.trim().length > 0
    const match = password === confirmPassword
    return codeOk && passOk && match
  }, [code, password, confirmPassword])

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

      const payload = (await res.json().catch(() => null)) as ApiError | null

      if (!res.ok) {
        throw new Error(parseApiMessage(payload, "Failed to send deletion code"))
      }

      setCodeSent(true)
      setSuccess(payload?.message || "Deletion code sent to your email.")
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
          password: password.trim(),
          code: code.trim(),
        }),
      })

      const payload = (await res.json().catch(() => null)) as ApiError | null

      if (!res.ok) {
        throw new Error(parseApiMessage(payload, "Failed to delete account"))
      }

      setSuccess(payload?.message || "Account deleted. Redirecting to login…")
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

          <div className="rounded-2xl border border-(--dk-ink)/10 bg-(--dk-paper) p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-(--dk-ink)">
              <MailCheck size={16} className="text-(--dk-sky)" />
              Request deletion code
            </div>
            <p className="text-xs text-(--dk-slate)">
              You must request a code before deleting. If the code expires or is
              wrong, request a new one.
            </p>
            <button
              type="button"
              onClick={onRequestDeleteCode}
              disabled={requesting || deleting}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed border border-(--dk-ink)/10 bg-(--dk-paper) hover:bg-(--dk-mist) text-(--dk-ink)"
            >
              {requesting
                ? "Sending code..."
                : codeSent
                  ? "Resend deletion code"
                  : "Send deletion code"}
            </button>
          </div>

          <div className="rounded-2xl border border-(--dk-ink)/10 bg-(--dk-paper) p-4 space-y-3">
            <div className="text-sm font-semibold text-(--dk-ink)">
              Confirm deletion
            </div>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 digit code"
                autoComplete="one-time-code"
                inputMode="numeric"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition bg-(--dk-paper) border-(--dk-ink)/10 focus:border-(--dk-sky) text-(--dk-ink)"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="new-password"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition bg-(--dk-paper) border-(--dk-ink)/10 focus:border-(--dk-sky) text-(--dk-ink)"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
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
          </div>

          {error ? <FormAlert>{error}</FormAlert> : null}
          {success ? <FormAlert type="success">{success}</FormAlert> : null}
        </div>
      </div>
    </main>
  )
}
