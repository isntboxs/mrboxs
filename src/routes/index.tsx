import { createFileRoute } from '@tanstack/react-router'
import type { GetCurrentlyPlayingTrack } from '@/types/spotify/get-currently-playing-track'
import { cn } from '@/lib/utils'
import { Header } from '@/components/header'
import { AboutSection } from '@/components/about-section'
import { env } from '@/lib/env/client'
import { ContactSocialsSection } from '@/components/contact-socials-section copy'

export const Route = createFileRoute('/')({
  component: App,
  loader: ({ context: { queryClient } }) => {
    return queryClient.prefetchQuery({
      queryKey: ['now-playing'],
      queryFn: async () => {
        const res = await fetch(`${env.VITE_APP_URL}/api/spotify/now-playing`)
        return res.json() as Promise<GetCurrentlyPlayingTrack>
      },
    })
  },
})

function App() {
  return (
    <div className="relative overflow-hidden">
      <main className="flex min-h-svh w-full flex-col items-center justify-center">
        <div
          className={cn(
            'absolute inset-0',
            'bg-size-[50px_50px]',
            'bg-[radial-gradient(#d4d4d4_1px,transparent_1px)]',
            'dark:bg-[radial-gradient(#404040_1px,transparent_1px)]',
            'pointer-events-none -z-10 opacity-60 dark:opacity-30',
          )}
        />
        <div
          className={cn(
            'absolute inset-0',
            'bg-size-[25px_25px]',
            'bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]',
            'dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]',
            'pointer-events-none -z-10 opacity-30 dark:opacity-15',
          )}
        />
        <div className="dark:bg-background bg-background pointer-events-none absolute inset-0 flex items-center justify-center mask-[radial-gradient(ellipse_at_center,transparent_75%,black)]" />
        <div className="pointer-events-none absolute inset-0 z-50 h-full w-full bg-[url('/grain.svg')] bg-size-[128px] bg-repeat opacity-[0.08] dark:opacity-[0.15]" />
        {/* main content */}
        <div className="border-primary/35 container mx-auto w-full max-w-3xl flex-1 border-x py-6">
          <Header />

          {/* Diagonal Grid */}
          <div className="relative h-10">
            <div
              className="absolute inset-0 opacity-[0.10]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  315deg,
                  #fff,
                  #fff 1px,
                  transparent 1px,
                  transparent 5px
                )`,
              }}
            />
          </div>

          <AboutSection />

          {/* Diagonal Grid */}
          <div className="relative h-10">
            <div
              className="absolute inset-0 -z-10 opacity-[0.10]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  315deg,
                  #fff,
                  #fff 1px,
                  transparent 1px,
                  transparent 5px
                )`,
              }}
            />
          </div>

          <ContactSocialsSection />

          {/* Diagonal Grid */}
          <div className="relative h-10">
            <div
              className="absolute inset-0 -z-10 opacity-[0.10]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  315deg,
                  #fff,
                  #fff 1px,
                  transparent 1px,
                  transparent 5px
                )`,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
