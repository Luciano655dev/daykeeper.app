"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import PostDetailCard from "@/components/Post/PostDetailCard"
import CommentsSection from "@/components/Post/CommentsSection"
import { usePostDetail } from "@/hooks/usePostDetail"

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>()
  const router = useRouter()

  const q = usePostDetail(postId)

  const loading = q.isLoading
  const error = q.error ? (q.error as any).message : null
  const post = q.data?.post ?? null
  const user = q.data?.user ?? null
  const postedAt = q.data?.postedAt ?? ""

  return (
    <main className="pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto border-x border-(--dk-ink)/10 bg-(--dk-paper) min-h-screen">
        <div className="sticky top-0 bg-(--dk-paper)/95 backdrop-blur-md">
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
              <div className="text-sm font-semibold text-(--dk-ink)">Post</div>
              <div className="text-xs text-(--dk-slate)">Details</div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="px-4 py-6 text-sm text-(--dk-slate)">Loading…</div>
        )}

        {!loading && error && (
          <div className="px-4 py-6 text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && post && user && (
          <>
            <PostDetailCard post={post} user={user} postedAt={postedAt} />
            <CommentsSection postId={post.id} />
          </>
        )}
      </div>
    </main>
  )
}
