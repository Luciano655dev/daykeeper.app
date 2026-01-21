export type FeedUserDay = {
  userId: string
  username: string
  userHandle: string
  profile_picture?: { url?: string } | null
  posts: FeedPost[]
}

export type FeedMedia = {
  _id: string
  type: "image" | "video" | string
  url: string
  title?: string
}

export type FeedPost = {
  id: string
  time?: string
  date?: string
  content: string
  privacy: String

  media?: FeedMedia[]

  likes?: number
  comments?: number
  userLiked?: boolean
  userCommented?: any
  edited_at: any
}

export function normalizeFeedPayload(json: any): FeedUserDay[] {
  const list =
    json?.data?.response?.data ?? json?.response?.data ?? json?.data ?? []

  if (!Array.isArray(list)) return []

  return list.map((u: any) => ({
    user_info: u.user_info,
    postsCount: u.postsCount,
    eventsCount: u.eventsCount,
    notesCount: u.notesCount,
    tasksCount: u.tasksCount,
    lastPostTime: u.lastPostTime,
    userId: String(u.userId ?? u._id ?? ""),
    username: String(u.username ?? u.user?.username ?? u.username ?? ""),
    userHandle: String(
      u.userHandle ?? u.handle ?? u.username ?? u.username ?? "",
    ),
    profile_picture: u.profile_picture ?? u.user?.profile_picture ?? null,
    posts: Array.isArray(u.posts)
      ? u.posts.map((p: any) => ({
          id: String(p.id ?? p._id ?? ""),
          time: p.time,
          date: p.date,
          content: String(p.content ?? p.data ?? ""),
          privacy: p.privacy,
          media: Array.isArray(p.media)
            ? p.media.map((m: any) => ({
                _id: String(m._id ?? ""),
                type: m.type,
                url: m.url,
                name: m.name,
              }))
            : [],

          likes: p.likes,
          comments: p.comments,
          userLiked: p.userLiked,
          userCommented: p.userCommented,
          edited_at: p?.edited_at,
          isOwner: p?.isOwner,
        }))
      : [],
  }))
}
