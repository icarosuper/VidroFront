import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactionType } from '#/shared/types'
import { getFeed, getTrending, getVideo, reactToVideo, registerView, removeReaction } from './api'
import type { Video } from './types'

export const videoKeys = {
  trending: () => ['videos', 'trending'] as const,
  feed: () => ['videos', 'feed'] as const,
  detail: (videoId: string) => ['videos', videoId] as const,
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
