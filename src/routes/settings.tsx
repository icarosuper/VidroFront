import { createFileRoute, redirect } from '@tanstack/react-router'
import { tokenStore } from '#/shared/lib/token-store'

export const Route = createFileRoute('/settings')({
  beforeLoad: () => {
    const isAuthenticated = tokenStore.get() !== null
    if (!isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: SettingsPage,
})

function SettingsPage() {
  return <main className="page-container py-8"><p>Settings</p></main>
}
