import { createFileRoute, redirect } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { AvatarUpload } from '#/features/users/components/AvatarUpload'
import { ProfileInfo } from '#/features/users/components/ProfileInfo'
import { useCurrentUser } from '#/features/users/hooks'
import { tokenStore } from '#/shared/lib/token-store'

export const Route = createFileRoute('/settings')({
  beforeLoad: () => {
    const isServer = typeof window === 'undefined'
    if (isServer) return

    const isAuthenticated = tokenStore.get() !== null
    if (!isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: SettingsPage,
})

function SettingsPage() {
  const { data: profile, isPending, isError, error } = useCurrentUser()

  if (isPending) {
    return <main className="page-container py-8"><p>Loading…</p></main>
  }

  if (isError) {
    return (
      <main className="page-container py-8">
        <p className="text-destructive">{error.message}</p>
      </main>
    )
  }

  return (
    <main className="page-container py-8">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
          </CardHeader>
          <CardContent>
            <AvatarUpload profile={profile} />
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileInfo profile={profile} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
