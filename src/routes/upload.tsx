import { createFileRoute, redirect } from '@tanstack/react-router'
import { tokenStore } from '#/shared/lib/token-store'

export const Route = createFileRoute('/upload')({
  beforeLoad: () => {
    const isAuthenticated = tokenStore.get() !== null
    if (!isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: UploadPage,
})

function UploadPage() {
  return <main className="page-container py-8"><p>Upload</p></main>
}
