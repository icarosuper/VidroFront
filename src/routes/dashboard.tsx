import { createFileRoute, redirect } from '@tanstack/react-router'
import { tokenStore } from '#/shared/lib/token-store'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    const isAuthenticated = tokenStore.get() !== null
    if (!isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  return <main className="page-container py-8"><p>Dashboard</p></main>
}
