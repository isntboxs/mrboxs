import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NowPlayingCard } from '@/components/now-playing-card'

export const AboutSection = () => {
  return (
    <section>
      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />

      <h1 className="text-muted-foreground px-4 text-base font-light">
        <span className="text-primary">$ </span>
        <span className="ml-1">cat ./about.md</span>
      </h1>
      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />

      <div className="flex h-full w-full items-center">
        <div className="border-primary/35 border-r">
          <Avatar className="size-32">
            <AvatarImage src="https://github.com/mrboxs.png" alt="@mrboxs" />
            <AvatarFallback className="text-4xl">MR</AvatarFallback>
          </Avatar>
        </div>

        <div className="relative flex h-32 flex-1 flex-col justify-end">
          <NowPlayingCard />

          <div>
            <div className="border-primary/35 absolute h-px w-full border-t" />
            <div className="ml-4 flex items-center gap-x-2">
              <h1 className="text-3xl font-bold">MrBoxs</h1>
              <div className="bg-primary h-7 w-2 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="border-primary/35 absolute h-px w-full border-t" />
            <p className="text-muted-foreground ml-4 text-sm">
              Amateur Web Developer.
            </p>
          </div>
        </div>
      </div>

      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />
    </section>
  )
}
