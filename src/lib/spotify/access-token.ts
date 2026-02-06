import qs from 'query-string'

import type { GetAccessTokenResponse } from '@/types/spotify/get-access-token-response'
import { env } from '@/lib/env/server'

const client_id = env.SPOTIFY_CLIENT_ID
const client_secret = env.SPOTIFY_CLIENT_SECRET
const refresh_token = env.SPOTIFY_REFRESH_TOKEN

const buffer = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`
const AUTH_PARAMS = qs.stringify({
  grant_type: 'refresh_token',
  refresh_token,
})

export const getSpotifyAccessToken = async (): Promise<
  GetAccessTokenResponse | undefined
> => {
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${buffer}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: AUTH_PARAMS,
    })
    if (!response.ok) {
      throw new Error(`Spotify token request failed: ${response.status}`)
    }
    return response.json() as Promise<GetAccessTokenResponse>
  } catch (error) {
    console.error(error)
  }
}
