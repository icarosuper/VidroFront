import { Link, createFileRoute } from '@tanstack/react-router'
import { Pencil, Users } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Separator } from '#/components/ui/separator'
import { Skeleton } from '#/components/ui/skeleton'
import { useIsAuthenticated } from '#/features/auth/hooks'
import { EditChannelForm } from '#/features/channels/components/EditChannelForm'
import { useChannel } from '#/features/channels/hooks'
import { ChannelVideoCard } from '#/features/videos/components/ChannelVideoCard'
import { useChannelVideos } from '#/features/videos/hooks'
import { useCurrentUser } from '#/features/users/hooks'

export const Route = createFileRoute('/$username/$channel')({
  component: ChannelPage,
})

function ChannelHeaderSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <Skeleton className="h-24 w-24 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChannelPage() {
  const { username, channel: handle } = Route.useParams()
  const isAuthenticated = useIsAuthenticated()
  const [editOpen, setEditOpen] = useState(false)

  const { data: channel, isPending: channelPending, isError, error } = useChannel(username, handle)
  const { data: currentUser } = useCurrentUser()
  const {
    data: videosData,
    isPending: videosPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChannelVideos(channel?.channelId)

  const isOwner = isAuthenticated && !!currentUser && !!channel && currentUser.userId === channel.ownerId

  const videos = videosData?.pages.flatMap((page) => page.videos) ?? []
  const channelInitial = channel?.name.charAt(0).toUpperCase() ?? '?'
  const ownerInitial = channel?.ownerUsername.charAt(0).toUpperCase() ?? '?'
  const followerCount = channel?.followerCount ?? 0
  const followerLabel = followerCount === 1 ? '1 follower' : `${followerCount} followers`

  if (isError) {
    return (
      <main className="page-container py-8">
        <p className="text-destructive">{error.message}</p>
      </main>
    )
  }

  return (
    <main className="page-container py-8 space-y-6">
      {/* Channel header */}
      {channelPending
        ? <ChannelHeaderSkeleton />
        : (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {/* Large channel avatar */}
                <Avatar className="h-24 w-24 shrink-0 rounded-lg">
                  <AvatarImage src={channel.avatarUrl ?? undefined} alt={channel.name} />
                  <AvatarFallback className="text-3xl rounded-lg">{channelInitial}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  {/* Name + edit */}
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold leading-tight">{channel.name}</h1>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditOpen(true)}
                        aria-label="Edit channel"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{channel.ownerUsername}/{channel.handle}</p>

                  {/* Description */}
                  {channel.description && (
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {channel.description}
                    </p>
                  )}

                  {/* Follower count */}
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {followerLabel}
                  </p>

                  {/* Owner info */}
                  <Separator className="my-3" />
                  <Link
                    to="/$username"
                    params={{ username: channel.ownerUsername }}
                    className="no-underline inline-flex items-center gap-2 group"
                  >
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage
                        src={channel.ownerAvatarUrl ?? undefined}
                        alt={channel.ownerUsername}
                      />
                      <AvatarFallback className="text-xs">{ownerInitial}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      By {channel.ownerUsername}
                    </span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Videos */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-muted-foreground uppercase tracking-wide text-xs">
          Videos
          {!videosPending && videos.length > 0 && ` (${videos.length}${hasNextPage ? '+' : ''})`}
        </h2>

        {videosPending && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no identity
              <div key={i} className="overflow-hidden rounded-lg border border-border">
                <Skeleton className="aspect-video w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!videosPending && videos.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No videos yet.</p>
        )}

        {!videosPending && videos.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <ChannelVideoCard key={video.videoId} video={video} isOwner={isOwner} />
              ))}
            </div>

            {hasNextPage && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {channel && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit channel</DialogTitle>
            </DialogHeader>
            <EditChannelForm channel={channel} onSuccess={() => setEditOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </main>
  )
}
