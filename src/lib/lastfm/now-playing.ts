import { z } from 'zod'
import type { NowPlayingTrack } from '@/types/now-playing'
import { env } from '@/lib/env/server'
import { NowPlayingError } from '@/lib/now-playing/error'

const trackSchema = z.object({
  name: z.string().min(1),
  artist: z.object({ '#text': z.string() }),
  album: z.object({ '#text': z.string() }).optional(),
  image: z
    .array(z.object({ '#text': z.string(), size: z.string() }))
    .optional(),
  url: z.url().refine((url) => /^https?:\/\//.test(url)),
  '@attr': z.object({ nowplaying: z.string().optional() }).optional(),
})
const responseSchema = z.object({
  recenttracks: z.object({
    track: z.union([z.array(trackSchema), trackSchema]),
  }),
})
const errorSchema = z.object({ error: z.number() })

let cached: { track: NowPlayingTrack | null; expiresAt: number } | undefined
let pending: Promise<NowPlayingTrack | null> | undefined
let failure: { error: NowPlayingError; retryAt: number } | undefined

const fetchNowPlaying = async (): Promise<NowPlayingTrack | null> => {
  if (!env.LASTFM_API_KEY || !env.LASTFM_USERNAME) {
    throw new NowPlayingError(
      'LASTFM_NOT_CONFIGURED',
      'Set LASTFM_USERNAME and LASTFM_API_KEY on the server.',
    )
  }

  const url = new URL('https://ws.audioscrobbler.com/2.0/')
  url.search = new URLSearchParams({
    method: 'user.getrecenttracks',
    user: env.LASTFM_USERNAME,
    api_key: env.LASTFM_API_KEY,
    format: 'json',
    limit: '1',
  }).toString()

  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (response.status === 429) {
    throw new NowPlayingError(
      'LASTFM_RATE_LIMITED',
      'Last.fm request limit reached. Try again later.',
    )
  }
  const data: unknown = await response.json()
  const apiError = errorSchema.safeParse(data)
  if (apiError.success) {
    switch (apiError.data.error) {
      case 10:
      case 26:
        throw new NowPlayingError(
          'LASTFM_INVALID_KEY',
          'Check the Last.fm API key.',
        )
      case 6:
        throw new NowPlayingError(
          'LASTFM_INVALID_USER',
          'Check the Last.fm username.',
        )
      case 29:
        throw new NowPlayingError(
          'LASTFM_RATE_LIMITED',
          'Last.fm request limit reached. Try again later.',
        )
      default:
        throw new NowPlayingError(
          'NOW_PLAYING_UNAVAILABLE',
          'Last.fm is temporarily unavailable.',
        )
    }
  }
  if (!response.ok) {
    throw new NowPlayingError(
      'NOW_PLAYING_UNAVAILABLE',
      'Last.fm is temporarily unavailable.',
    )
  }

  const tracks = responseSchema.parse(data).recenttracks.track
  const track = Array.isArray(tracks) ? tracks.at(0) : tracks
  // The latest scrobble is listening history unless Last.fm explicitly marks it live.
  if (track?.['@attr']?.nowplaying !== 'true') return null

  const artwork = ['extralarge', 'large', 'medium', 'small']
    .map((size) => track.image?.find((image) => image.size === size)?.['#text'])
    .find((image) => image?.startsWith('https://'))

  // The API's -img hostname can reject image requests; use the public Last.fm CDN.
  const artworkUrl = artwork?.replace(
    /^https:\/\/lastfm-img\.freetls\.fastly\.net\//,
    'https://lastfm.freetls.fastly.net/',
  )

  return {
    title: track.name,
    artist: track.artist['#text'],
    album: track.album?.['#text'] ?? '',
    artworkUrl: artworkUrl ?? null,
    url: track.url,
  }
}

export const getNowPlaying = (): Promise<NowPlayingTrack | null> => {
  if (cached && cached.expiresAt > Date.now())
    return Promise.resolve(cached.track)
  if (failure && failure.retryAt > Date.now())
    return Promise.reject(failure.error)

  pending ??= fetchNowPlaying()
    .then((track) => {
      cached = { track, expiresAt: Date.now() + 15_000 }
      failure = undefined
      return track
    })
    .catch((error: unknown) => {
      const safeError =
        error instanceof NowPlayingError
          ? error
          : new NowPlayingError(
              'NOW_PLAYING_UNAVAILABLE',
              'Could not read the current track from Last.fm.',
            )
      // Fetch errors can contain the URL and API key; only expose fixed messages.
      failure = { error: safeError, retryAt: Date.now() + 30_000 }
      throw safeError
    })
    .finally(() => {
      pending = undefined
    })
  return pending
}
