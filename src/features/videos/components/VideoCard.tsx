import { Link } from '@tanstack/react-router'
import { Eye, ThumbsUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Card, CardContent } from '#/components/ui/card'
import type { VideoSummary } from '../types'

type VideoCardProps = {
  video: VideoSummary
}

function formatViewCount(count: number): string {
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

export function VideoCard({ video }: VideoCardProps) {
  const thumbnailUrl = video.thumbnailUrls[0] ?? null
  const channelInitial = video.channelName.charAt(0).toUpperCase()
  const viewCountFormatted = formatViewCount(video.viewCount)
  const likeCountFormatted = formatViewCount(video.likeCount)
  const relativeTime = formatRelativeTime(video.createdAt)

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
        </div>

        <CardContent className="p-3">
          <div className="flex gap-3">
            <Avatar className="mt-0.5 h-8 w-8 shrink-0">
              <AvatarImage src={video.channelAvatarUrl ?? undefined} alt={video.channelName} />
              <AvatarFallback className="text-xs">{channelInitial}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
                {video.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{video.channelName}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
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
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
