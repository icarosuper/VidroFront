import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="page-container py-8">
      <h1 className="text-2xl font-bold">Vidro</h1>
    </main>
  )
}
