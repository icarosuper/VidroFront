import type { EnumValue } from '#/shared/types'

export type VideoSummary = {
  videoId: string
  channelId: string
  channelName: string
  channelAvatarUrl: string | null
  title: string
  description: string | null
  tags: string[]
  viewCount: number
  likeCount: number
  thumbnailUrls: string[]
  createdAt: string
}

export type Video = {
  videoId: string
  channelId: string
  channelName: string
  channelAvatarUrl: string | null
  title: string
  description: string | null
  tags: string[]
  visibility: EnumValue
  status: EnumValue
  viewCount: number
  likeCount: number
  dislikeCount: number
  commentCount: number
  thumbnailUrls: string[]
  videoUrl: string | null
  createdAt: string
}

export type TrendingResponse = {
  videos: VideoSummary[]
}

export type FeedPage = {
  videos: VideoSummary[]
  nextCursor: string | null
}
