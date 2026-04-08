import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/watch/$videoId')({
  component: WatchPage,
})

function WatchPage() {
  const { videoId } = Route.useParams()
  return <main className="page-container py-8"><p>Watch: {videoId}</p></main>
}
