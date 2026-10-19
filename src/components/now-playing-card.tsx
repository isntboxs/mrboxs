import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useNowPlaying } from '@/hooks/use-now-playing'

export const NowPlayingCard = () => {
  const { data: track, isError } = useNowPlaying()
  if (!track || isError) return null

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Now playing: ${track.title} by ${track.artist}`}
      className="group my-1 ml-4 flex w-56 max-w-full items-center gap-2 max-sm:ml-0 max-sm:w-full max-sm:px-4"
    >
      <Avatar className="size-16 shrink-0 rounded-none! after:border-none!">
        <AvatarImage
          src={track.artworkUrl ?? undefined}
          alt={
            track.album ? `${track.album} album cover` : `${track.title} cover`
          }
          className="rounded-none!"
        />
        <AvatarFallback className="rounded-none!">
          {track.title.at(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex h-16 min-w-0 flex-1 flex-col justify-center gap-1">
        <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
          <span
            aria-hidden="true"
            className="bg-primary size-1.5 animate-pulse rounded-full"
          />
          Listening now
        </p>
        <p
          className="truncate text-sm font-medium group-hover:underline group-hover:underline-offset-4"
          title={track.title}
        >
          {track.title}
        </p>
        <p
          className="text-muted-foreground truncate text-xs"
          title={track.artist}
        >
          {track.artist}
        </p>
      </div>
    </a>
  )
}
