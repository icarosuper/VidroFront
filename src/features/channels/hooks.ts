import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createChannel, getChannel, getUserChannels, updateChannel } from './api'
import type { CreateChannelRequest, UpdateChannelRequest } from './types'

export const channelKeys = {
  userChannels: (username: string) => ['channels', 'user', username] as const,
  detail: (username: string, handle: string) => ['channels', username, handle] as const,
}

export function useUserChannels(username: string | undefined) {
  return useQuery({
    queryKey: channelKeys.userChannels(username ?? ''),
    queryFn: ({ signal }) => getUserChannels(username!, signal),
    enabled: !!username,
  })
}

export function useChannel(username: string | undefined, handle: string | undefined) {
  return useQuery({
    queryKey: channelKeys.detail(username ?? '', handle ?? ''),
    queryFn: ({ signal }) => getChannel(username!, handle!, signal),
    enabled: !!username && !!handle,
  })
}

export function useCreateChannel(username: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateChannelRequest) => createChannel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: channelKeys.userChannels(username ?? ''),
      })
    },
  })
}

export function useUpdateChannel(username: string, handle: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateChannelRequest) => updateChannel(handle, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: channelKeys.detail(username, handle),
      })
    },
  })
}
