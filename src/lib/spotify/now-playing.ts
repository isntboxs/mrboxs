import type { GetCurrentlyPlayingTrack } from '@/types/spotify/get-currently-playing-track'
import { getSpotifyAccessToken } from '@/lib/spotify/access-token'

const BASE_URL = 'https://api.spotify.com/v1/me/player/currently-playing'

export const getNowPlaying = async () => {
  try {
    const token = await getSpotifyAccessToken()
    if (!token) {
      return undefined
    }
    const response = await fetch(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    })
    if (response.status === 204 || response.status === 202) {
      return undefined
    }
    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`)
    }
    return (await response.json()) as GetCurrentlyPlayingTrack
  } catch (error) {
    console.error(error)
  }
}
