import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$username')({
  component: UserPage,
})

function UserPage() {
  const { username } = Route.useParams()
  return <main className="page-container py-8"><p>Usuário: {username}</p></main>
}
