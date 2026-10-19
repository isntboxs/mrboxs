export type NowPlayingErrorCode =
  | 'LASTFM_NOT_CONFIGURED'
  | 'LASTFM_INVALID_KEY'
  | 'LASTFM_INVALID_USER'
  | 'LASTFM_RATE_LIMITED'
  | 'NOW_PLAYING_UNAVAILABLE'

export class NowPlayingError extends Error {
  constructor(
    public readonly code: NowPlayingErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'NowPlayingError'
  }
}
