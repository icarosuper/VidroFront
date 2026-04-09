import { Link } from '@tanstack/react-router'
import { Eye, ThumbsUp } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent } from '#/components/ui/card'
import { VideoVisibility } from '#/shared/types'
import type { ChannelVideoSummary } from '../types'

type Props = {
  video: ChannelVideoSummary
  isOwner: boolean
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return String(count)
}

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

function visibilityBadgeVariant(visibilityId: number): 'default' | 'secondary' | 'outline' {
  if (visibilityId === VideoVisibility.Public) return 'default'
  if (visibilityId === VideoVisibility.Unlisted) return 'secondary'
  return 'outline'
}

export function ChannelVideoCard({ video, isOwner }: Props) {
  const thumbnailUrl = video.thumbnailUrls[0] ?? null
  const viewCountFormatted = formatCount(video.viewCount)
  const likeCountFormatted = formatCount(video.likeCount)
  const relativeTime = formatRelativeTime(video.createdAt)
  const isNotPublic = video.visibility.id !== VideoVisibility.Public
  const isNotReady = video.status.value !== 'Ready'

  return (
    <Link to="/watch/$videoId" params={{ videoId: video.videoId }} className="no-underline">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-video w-full bg-muted">
          {thumbnailUrl
            ? (
              <img
                src={thumbnailUrl}
                alt={video.title}
                className="h-full w-full object-cover"
              />
            )
            : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-muted-foreground text-sm">No thumbnail</span>
              </div>
            )}

          {isOwner && isNotReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-xs font-medium text-white">{video.status.value}</span>
            </div>
          )}
        </div>

        <CardContent className="p-3 space-y-2">
          <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
            {video.title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {viewCountFormatted}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {likeCountFormatted}
            </span>
            <span>{relativeTime}</span>
          </div>

          {isOwner && isNotPublic && (
            <Badge variant={visibilityBadgeVariant(video.visibility.id)} className="text-xs">
              {video.visibility.value}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
