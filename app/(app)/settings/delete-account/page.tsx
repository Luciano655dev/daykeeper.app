"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Ban } from "lucide-react"

export default function DeleteAccountPage() {
  const router = useRouter()

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
                  Under maintenance
                </div>
                <div className="text-xs text-(--dk-slate)">
                  Account deletion is temporarily unavailable. Please check
                  back later.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
