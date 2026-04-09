import { apiClient } from '#/shared/lib/api-client'
import type {
  Channel,
  ChannelsResponse,
  CreateChannelRequest,
  CreateChannelResponse,
  UpdateChannelRequest,
} from './types'

export function getUserChannels(username: string, signal?: AbortSignal) {
  return apiClient.get<ChannelsResponse>(`/v1/users/${username}/channels`, signal)
}

export function getChannel(username: string, handle: string, signal?: AbortSignal) {
  return apiClient.get<Channel>(`/v1/users/${username}/channels/${handle}`, signal)
}

export function createChannel(data: CreateChannelRequest, signal?: AbortSignal) {
  return apiClient.post<CreateChannelResponse>('/v1/channels', data, signal)
}

export function updateChannel(handle: string, data: UpdateChannelRequest, signal?: AbortSignal) {
  return apiClient.put<void>(`/v1/channels/${handle}`, data, signal)
}
