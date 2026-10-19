export type SpotifyErrorCode =
  | 'SPOTIFY_REAUTH_REQUIRED'
  | 'SPOTIFY_INVALID_CLIENT'
  | 'SPOTIFY_FORBIDDEN'
  | 'SPOTIFY_RATE_LIMITED'
  | 'SPOTIFY_UNAVAILABLE'

export class SpotifyError extends Error {
  constructor(
    public readonly code: SpotifyErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'SpotifyError'
  }
}
