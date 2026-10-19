import { queryOptions } from '@tanstack/react-query'
import type { NowPlayingTrack } from '@/types/now-playing'
import type { NowPlayingErrorCode } from '@/lib/now-playing/error'
import { NowPlayingError } from '@/lib/now-playing/error'
import { env } from '@/lib/env/client'

export const fetchNowPlaying = async (
  signal?: AbortSignal,
): Promise<NowPlayingTrack | null> => {
  const url =
    typeof window === 'undefined'
      ? new URL('/api/now-playing', env.VITE_APP_URL)
      : '/api/now-playing'
  const response = await fetch(url, { signal })
  if (response.status === 204) {
    return null
  }
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      code?: NowPlayingErrorCode
      error?: string
    } | null
    throw new NowPlayingError(
      data?.code ?? 'NOW_PLAYING_UNAVAILABLE',
      data?.error ?? 'Now playing is temporarily unavailable.',
    )
  }
  return response.json() as Promise<NowPlayingTrack>
}

export const nowPlayingQueryOptions = queryOptions({
  queryKey: ['now-playing', 'lastfm'],
  queryFn: ({ signal }) => fetchNowPlaying(signal),
  staleTime: 15_000,
  retry: false,
  retryOnMount: false,
  refetchOnReconnect: 'always',
  refetchOnWindowFocus: 'always',
  refetchInterval: (query) => {
    const error = query.state.error
    if (
      error instanceof NowPlayingError &&
      (error.code === 'LASTFM_NOT_CONFIGURED' ||
        error.code === 'LASTFM_INVALID_KEY' ||
        error.code === 'LASTFM_INVALID_USER')
    ) {
      return false
    }
    return query.state.status === 'error' ? 60_000 : 30_000
  },
})
