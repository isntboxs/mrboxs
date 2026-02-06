import type { GetCurrentlyPlayingTrack } from '@/types/spotify/get-currently-playing-track'
import { getSpotifyAccessToken } from '@/lib/spotify/access-token'

const BASE_URL = 'https://api.spotify.com/v1/me/player/currently-playing'

export const getNowPlaying = async () => {
  try {
    const token = await getSpotifyAccessToken()

    const response = await fetch(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token?.access_token}`,
      },
    })

    return response.json() as Promise<GetCurrentlyPlayingTrack>
  } catch (error) {
    console.error(error)
  }
}
