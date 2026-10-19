import type { GetCurrentlyPlayingTrack } from '@/types/spotify/get-currently-playing-track'
import {
  getSpotifyAccessToken,
  invalidateSpotifyAccessToken,
} from '@/lib/spotify/access-token'
import { SpotifyError } from '@/lib/spotify/error'

const BASE_URL = 'https://api.spotify.com/v1/me/player/currently-playing'

export const getNowPlaying =
  async (): Promise<GetCurrentlyPlayingTrack | null> => {
    const requestPlayback = async () => {
      const accessToken = await getSpotifyAccessToken()
      return fetch(BASE_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(10_000),
      })
    }

    let response = await requestPlayback()
    if (response.status === 401) {
      invalidateSpotifyAccessToken()
      response = await requestPlayback()
    }
    if (response.status === 204 || response.status === 202) {
      return null
    }
    if (response.status === 403) {
      throw new SpotifyError(
        'SPOTIFY_FORBIDDEN',
        'Spotify denied access. Check Premium for the Development Mode app owner, the user allowlist, and user-read-currently-playing permission.',
      )
    }
    if (response.status === 429) {
      throw new SpotifyError(
        'SPOTIFY_RATE_LIMITED',
        'Spotify request limit reached. Try again later.',
      )
    }
    if (!response.ok) {
      throw new SpotifyError(
        'SPOTIFY_UNAVAILABLE',
        'Spotify playback is temporarily unavailable.',
      )
    }

    const data = (await response.json()) as GetCurrentlyPlayingTrack
    // Ads and podcast episodes do not have the track/album shape used by the card.
    return data.currently_playing_type === 'track' && data.item ? data : null
  }
