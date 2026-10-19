import { queryOptions } from '@tanstack/react-query'
import type { GetCurrentlyPlayingTrack } from '@/types/spotify/get-currently-playing-track'
import type { SpotifyErrorCode } from '@/lib/spotify/error'
import { SpotifyError } from '@/lib/spotify/error'
import { env } from '@/lib/env/client'

export const fetchNowPlaying = async (
  signal?: AbortSignal,
): Promise<GetCurrentlyPlayingTrack | null> => {
  const url =
    typeof window === 'undefined'
      ? new URL('/api/spotify/now-playing', env.VITE_APP_URL)
      : '/api/spotify/now-playing'
  const response = await fetch(url, { signal })
  if (response.status === 204) {
    return null
  }
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      code?: SpotifyErrorCode
      error?: string
    } | null
    throw new SpotifyError(
      data?.code ?? 'SPOTIFY_UNAVAILABLE',
      data?.error ?? 'Spotify playback is temporarily unavailable.',
    )
  }
  return response.json() as Promise<GetCurrentlyPlayingTrack>
}

export const nowPlayingQueryOptions = queryOptions({
  queryKey: ['now-playing'],
  queryFn: ({ signal }) => fetchNowPlaying(signal),
  staleTime: 15_000,
  retry: false,
  retryOnMount: false,
  refetchOnReconnect: 'always',
  refetchOnWindowFocus: 'always',
  refetchInterval: (query) => {
    const error = query.state.error
    if (
      error instanceof SpotifyError &&
      (error.code === 'SPOTIFY_REAUTH_REQUIRED' ||
        error.code === 'SPOTIFY_INVALID_CLIENT' ||
        error.code === 'SPOTIFY_FORBIDDEN')
    ) {
      return false
    }
    return query.state.status === 'error' ? 60_000 : 30_000
  },
})
