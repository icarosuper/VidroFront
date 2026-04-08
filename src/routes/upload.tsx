import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/upload')({
  component: UploadPage,
})

function UploadPage() {
  return <main className="page-container py-8"><p>Upload</p></main>
}
