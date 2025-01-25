import { GetTrackResponse } from "@/types/spotify/get-track-response";

export interface GetCurrentlyPlayingTrack {
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: {
    track: GetTrackResponse;
  };
  currently_playing_type: string;
  actions: {
    disallows: {
      pausing?: boolean;
      resuming?: boolean;
    };
  };
}
