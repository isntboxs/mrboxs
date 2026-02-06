import { Link, useLocation } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [{ href: '/', label: 'home' }]

export const Header = () => {
  const location = useLocation()

  return (
    <header className="w-full">
      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />
      <h1 className="text-muted-foreground px-4 text-base font-light">
        <span className="text-primary">~ </span>
        <span className="ml-1">mrboxs-site</span>
      </h1>
      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />

      <nav className="flex items-center gap-x-2 px-4">
        {navLinks.map((link) => (
          <Button
            key={link.href}
            variant="link"
            size="lg"
            className={cn(
              'decoration-muted-foreground hover:decoration-primary p-0 text-sm underline decoration-dashed underline-offset-8 transition-all duration-500 ease-in-out hover:decoration-solid',
              link.href !== location.pathname && 'text-muted-foreground',
            )}
            asChild
          >
            <Link to={link.href} viewTransition>
              {link.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />
    </header>
  )
}
