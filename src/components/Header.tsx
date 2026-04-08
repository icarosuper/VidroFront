import { Link } from '@tanstack/react-router'
import { LogOut, User } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useAuthModal, useIsAuthenticated, useSignOut } from '#/features/auth/hooks'

export function Header() {
  const isAuthenticated = useIsAuthenticated()
  const { openSignIn } = useAuthModal()
  const signOut = useSignOut()

  function handleSignOut() {
    signOut.mutate()
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="page-container flex h-14 items-center justify-between">
        <Link to="/" className="text-lg font-bold text-foreground no-underline">
          Vidro
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated
            ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                    <span className="ml-1">Dashboard</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={signOut.isPending}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-1">Sign out</span>
                </Button>
              </>
            )
            : (
              <Button size="sm" onClick={openSignIn}>
                Sign in
              </Button>
            )}
        </div>
      </div>
    </header>
  )
}
