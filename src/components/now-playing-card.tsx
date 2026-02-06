import { motion } from 'motion/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SlidingNumber } from '@/components/ui/sliding-number'
import { useNowPlaying } from '@/hooks/spotify/use-now-playing'

export const NowPlayingCard = () => {
  const { nowPlaying, trackProgress, elapsedTimeMs } = useNowPlaying()
  const minutes = Math.floor(elapsedTimeMs / 60000)
  const seconds = Math.floor((elapsedTimeMs % 60000) / 1000)

  const durationMs = nowPlaying.data?.item?.duration_ms ?? 0
  const remainingMs = Math.max(0, durationMs - elapsedTimeMs)
  const remainingMinutes = Math.floor(remainingMs / 60000)
  const remainingSeconds = Math.floor((remainingMs % 60000) / 1000)

  if (!nowPlaying.data?.item) {
    return null
  }

  return (
    <div className="my-1 ml-4 flex w-56 items-center gap-2 max-sm:ml-0 max-sm:w-full max-sm:px-4">
      <Avatar className="size-16 rounded-none! after:border-none!">
        <AvatarImage
          src={nowPlaying.data.item.album.images[0].url}
          className="rounded-none!"
        />
        <AvatarFallback className="rounded-none!">
          {nowPlaying.data.item.name.at(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex h-16 flex-1 flex-col justify-between">
        <div>
          <p className="line-clamp-1">
            <a
              href={nowPlaying.data.item.external_urls.spotify}
              className="text-sm font-medium transition-all duration-300 ease-in-out hover:text-green-500 hover:underline hover:underline-offset-4"
            >
              {nowPlaying.data.item.name}
            </a>
          </p>
          <p className="text-muted-foreground line-clamp-1 text-xs">
            {nowPlaying.data.item.artists.map((artist, index) => (
              <span key={artist.id}>
                {index > 0 && ', '}
                <a
                  href={artist.external_urls.spotify}
                  className="transition-all duration-300 ease-in-out hover:text-green-500 hover:underline hover:underline-offset-4"
                >
                  {artist.name}
                </a>
              </span>
            ))}
          </p>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-1">
          <div className="flex items-center gap-0.5 font-mono text-[10px] tabular-nums">
            <SlidingNumber value={minutes} padStart />
            <span className="text-muted-foreground">:</span>
            <SlidingNumber value={seconds} padStart />
          </div>
          <div className="bg-secondary h-0.5 w-full overflow-hidden rounded-full">
            <motion.div
              className="bg-primary h-full"
              initial={{ width: 0 }}
              animate={{ width: `${trackProgress}%` }}
              transition={{
                type: 'spring',
                stiffness: 70,
                damping: 15,
                mass: 1,
              }}
            />
          </div>
          <div className="flex items-center gap-0.5 font-mono text-[10px] tabular-nums">
            <SlidingNumber value={remainingMinutes} padStart />
            <span className="text-muted-foreground">:</span>
            <SlidingNumber value={remainingSeconds} padStart />
          </div>
        </div>
      </div>
    </div>
  )
}
