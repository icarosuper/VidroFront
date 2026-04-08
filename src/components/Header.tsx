import { Link } from '@tanstack/react-router'

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="page-container flex h-14 items-center justify-between">
        <Link to="/" className="text-lg font-bold text-foreground no-underline">
          Vidro
        </Link>
      </div>
    </header>
  )
}
