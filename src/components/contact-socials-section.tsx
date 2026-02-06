import { ArrowUpRight } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { buttonVariants } from './ui/button'
import { cn } from '@/lib/utils'
import { SimpleIcons } from '@/components/simple-icons'

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/mrboxs',
    icon: SimpleIcons.GitHub,
    username: 'mrboxs',
  },
  {
    name: 'X',
    href: 'https://x.com/isntboxs',
    icon: SimpleIcons.X,
    username: 'isntboxs',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/mrboxs',
    icon: SimpleIcons.Instagram,
    username: 'mrboxs',
  },
  {
    name: 'Gmail',
    href: 'mailto:mrboxs@gmail.com',
    icon: SimpleIcons.Gmail,
    username: 'mrboxs@gmail.com',
  },
]

export const ContactSocialsSection = () => {
  return (
    <section>
      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />

      <h1 className="text-muted-foreground px-4 text-base font-light">
        <span className="text-primary">$ </span>
        <span className="ml-1">lsa ./contact && lsa ./socials</span>
      </h1>
      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />

      <div className="relative grid h-full w-full grid-cols-2 items-center gap-4 p-4 md:grid-cols-4">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group hover:bg-accent grid w-full grid-cols-[auto_1fr] items-center gap-2 p-2 transition-all duration-300 ease-in-out"
          >
            <link.icon className="size-8" />
            <div className="flex w-full items-center justify-between">
              <div className="w-20">
                <p className="text-muted-foreground text-sm">{link.name}</p>
                <p className="text-primary truncate text-xs">
                  <span className="mr-1">@</span>
                  <span>{link.username}</span>
                </p>
              </div>

              <span
                className={cn(
                  buttonVariants({ size: 'icon', variant: 'ghost' }),
                )}
              >
                <HugeiconsIcon icon={ArrowUpRight} />
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />
    </section>
  )
}
