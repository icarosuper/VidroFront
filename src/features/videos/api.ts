import { ReactionType } from '#/shared/types'
import { apiClient } from '#/shared/lib/api-client'
import type { FeedPage, TrendingResponse, Video } from './types'

export function getTrending(limit: number, signal?: AbortSignal) {
  return apiClient.get<TrendingResponse>(`/v1/videos/trending?limit=${limit}`, signal)
}

export function getFeed(limit: number, cursor: string | undefined, signal?: AbortSignal) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set('cursor', cursor)
  return apiClient.get<FeedPage>(`/v1/feed?${params.toString()}`, signal)
}

export function getVideo(videoId: string, signal?: AbortSignal) {
  return apiClient.get<Video>(`/v1/videos/${videoId}`, signal)
}

export function registerView(videoId: string, signal?: AbortSignal) {
  return apiClient.post<void>(`/v1/videos/${videoId}/view`, undefined, signal)
}

export function reactToVideo(videoId: string, type: ReactionType, signal?: AbortSignal) {
  return apiClient.post<void>(`/v1/videos/${videoId}/react`, { type }, signal)
}

export function removeReaction(videoId: string, signal?: AbortSignal) {
  return apiClient.delete<void>(`/v1/videos/${videoId}/react`, signal)
}
