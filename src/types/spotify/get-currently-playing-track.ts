import type { GetTrackResponse } from '@/types/spotify/get-track-response'

export interface GetCurrentlyPlayingTrack {
  context?: Context
  timestamp: number
  progress_ms: number
  is_playing: boolean
  item: GetTrackResponse | null
  currently_playing_type: string
  actions: {
    disallows: {
      pausing?: boolean
      resuming?: boolean
    }
  }
}

interface Context {
  type: string
  href: string
  external_urls: {
    spotify: string
  }
  url: string
}
