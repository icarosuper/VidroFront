export type CreateChannelRequest = {
  handle: string
  name: string
  description: string | null
}

export type CreateChannelResponse = {
  channelId: string
  handle: string
}

export type UpdateChannelRequest = {
  name: string
  description: string | null
}

export type ChannelSummary = {
  channelId: string
  handle: string
  name: string
  description: string | null
  followerCount: number
  avatarUrl: string | null
}

export type ChannelsResponse = {
  channels: ChannelSummary[]
}

export type Channel = {
  channelId: string
  handle: string
  name: string
  description: string | null
  followerCount: number
  ownerId: string
  ownerUsername: string
  avatarUrl: string | null
  ownerAvatarUrl: string | null
}
