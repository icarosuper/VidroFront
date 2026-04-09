import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactionType } from '#/shared/types'
import { VideoStatus } from '#/shared/types'
import {
  createVideo,
  getFeed,
  getChannelVideos,
  getTrending,
  getVideo,
  reactToVideo,
  registerView,
  removeReaction,
  updateVideo,
  uploadThumbnail,
} from './api'
import type { CreateVideoRequest, UpdateVideoRequest, Video } from './types'

export const videoKeys = {
  trending: () => ['videos', 'trending'] as const,
  feed: () => ['videos', 'feed'] as const,
  detail: (videoId: string) => ['videos', videoId] as const,
  channelVideos: (channelId: string) => ['videos', 'channel', channelId] as const,
}

const TRENDING_LIMIT = 20
const FEED_LIMIT = 20

export function useTrending() {
  return useQuery({
    queryKey: videoKeys.trending(),
    queryFn: ({ signal }) => getTrending(TRENDING_LIMIT, signal),
  })
}

export function useFeed(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: videoKeys.feed(),
    queryFn: ({ signal, pageParam }) =>
      getFeed(FEED_LIMIT, pageParam as string | undefined, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor
        ? lastPage.nextCursor
        : undefined,
    enabled,
  })
}

export function useVideo(videoId: string) {
  return useQuery({
    queryKey: videoKeys.detail(videoId),
    queryFn: ({ signal }) => getVideo(videoId, signal),
  })
}

export function useRegisterView(videoId: string) {
  return useMutation({
    mutationFn: () => registerView(videoId),
  })
}

export function useReactToVideo(videoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (type: ReactionType) => reactToVideo(videoId, type),
    onSuccess: (_data, reactionType) => {
      queryClient.setQueryData(videoKeys.detail(videoId), (prev: Video | undefined) => {
        if (!prev) return prev
        const isLike = reactionType === 1
        return {
          ...prev,
          likeCount: isLike
            ? prev.likeCount + 1
            : prev.likeCount,
          dislikeCount: isLike
            ? prev.dislikeCount
            : prev.dislikeCount + 1,
        }
      })
    },
  })
}

export function useRemoveReaction(videoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => removeReaction(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) })
    },
  })
}

const VIDEO_PROCESSING_POLL_INTERVAL_MS = 3000

export function useVideoStatus(videoId: string | null) {
  return useQuery({
    queryKey: videoKeys.detail(videoId ?? ''),
    queryFn: ({ signal }) => getVideo(videoId!, signal),
    enabled: !!videoId,
    refetchInterval: (query) => {
      const status = query.state.data?.status.id
      const isTerminal =
        status === VideoStatus.Ready || status === VideoStatus.Failed
      return isTerminal
        ? false
        : VIDEO_PROCESSING_POLL_INTERVAL_MS
    },
  })
}

export function useCreateVideo(channelId: string) {
  return useMutation({
    mutationFn: (data: CreateVideoRequest) => createVideo(channelId, data),
  })
}

export function useUpdateVideo(videoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateVideoRequest) => updateVideo(videoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) })
    },
  })
}

const CHANNEL_VIDEOS_LIMIT = 20

export function useChannelVideos(channelId: string | undefined) {
  return useInfiniteQuery({
    queryKey: videoKeys.channelVideos(channelId ?? ''),
    queryFn: ({ signal, pageParam }) =>
      getChannelVideos(channelId!, CHANNEL_VIDEOS_LIMIT, pageParam as string | undefined, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor
        ? lastPage.nextCursor
        : undefined,
    enabled: !!channelId,
  })
}

export function useUploadThumbnail(videoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadThumbnail(videoId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) })
    },
  })
}
