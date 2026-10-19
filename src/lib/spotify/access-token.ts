import type { GetAccessTokenResponse } from '@/types/spotify/get-access-token-response'
import { env } from '@/lib/env/server'
import { SpotifyError } from '@/lib/spotify/error'

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const TOKEN_EXPIRY_BUFFER_MS = 60_000

let refreshToken = env.SPOTIFY_REFRESH_TOKEN
let cachedToken: { accessToken: string; expiresAt: number } | undefined
let pendingToken: Promise<string> | undefined
let lastFailure: { error: SpotifyError; retryAt: number } | undefined

export const invalidateSpotifyAccessToken = () => {
  cachedToken = undefined
}

const refreshAccessToken = async () => {
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    const data = (await response.json()) as Partial<GetAccessTokenResponse> & {
      error?: string
    }

    if (!response.ok) {
      if (data.error === 'invalid_grant') {
        throw new SpotifyError(
          'SPOTIFY_REAUTH_REQUIRED',
          'Spotify authorization has expired or was revoked. Reconnect the Spotify account.',
        )
      }
      if (data.error === 'invalid_client') {
        throw new SpotifyError(
          'SPOTIFY_INVALID_CLIENT',
          'Spotify client credentials are invalid. Check the app configuration.',
        )
      }
      throw new SpotifyError(
        'SPOTIFY_UNAVAILABLE',
        'Spotify authentication is temporarily unavailable.',
      )
    }

    if (!data.access_token || !data.expires_in) {
      throw new SpotifyError(
        'SPOTIFY_UNAVAILABLE',
        'Spotify returned an invalid token response.',
      )
    }

    // Spotify may rotate the refresh token; keep the replacement for later refreshes.
    refreshToken = data.refresh_token ?? refreshToken
    cachedToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    }
    lastFailure = undefined
    return data.access_token
  } catch (error) {
    const failure =
      error instanceof SpotifyError
        ? error
        : new SpotifyError(
            'SPOTIFY_UNAVAILABLE',
            'Could not connect to Spotify authentication.',
          )
    // Avoid hammering Spotify with the same invalid credentials on every visitor poll.
    lastFailure = { error: failure, retryAt: Date.now() + 60_000 }
    throw failure
  }
}

export const getSpotifyAccessToken = (): Promise<string> => {
  if (
    cachedToken &&
    cachedToken.expiresAt > Date.now() + TOKEN_EXPIRY_BUFFER_MS
  ) {
    return Promise.resolve(cachedToken.accessToken)
  }
  if (lastFailure && lastFailure.retryAt > Date.now()) {
    return Promise.reject(lastFailure.error)
  }

  pendingToken ??= refreshAccessToken().finally(() => {
    pendingToken = undefined
  })
  return pendingToken
}
