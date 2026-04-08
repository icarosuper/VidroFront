import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$username/$channel')({
  component: ChannelPage,
})

function ChannelPage() {
  const { username, channel } = Route.useParams()
  return <main className="page-container py-8"><p>Canal: {username}/{channel}</p></main>
}
