import { Link } from '@tanstack/react-router'
import { Eye, Pencil, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { VideoVisibility } from '#/shared/types'
import type { ChannelVideoSummary } from '../types'
import { EditVideoForm } from './EditVideoForm'

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
  const [editOpen, setEditOpen] = useState(false)

  const thumbnailUrl = video.thumbnailUrls[0] ?? null
  const viewCountFormatted = formatCount(video.viewCount)
  const likeCountFormatted = formatCount(video.likeCount)
  const relativeTime = formatRelativeTime(video.createdAt)
  const isNotPublic = video.visibility.id !== VideoVisibility.Public
  const isNotReady = video.status.value !== 'Ready'

  function handleEditClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setEditOpen(true)
  }

  return (
    <>
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

            {isOwner && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleEditClick}
                aria-label="Edit video"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <CardContent className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground flex-1">
                {video.title}
              </h3>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 -mr-1"
                  onClick={handleEditClick}
                  aria-label="Edit video"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
            </div>

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

      {isOwner && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit video</DialogTitle>
            </DialogHeader>
            <EditVideoForm video={video} onSuccess={() => setEditOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
