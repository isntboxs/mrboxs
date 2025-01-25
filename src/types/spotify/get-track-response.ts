import { GetAlbumsResponse } from "@/types/spotify/get-albums-response";

export interface GetTrackResponse {
  album: GetAlbumsResponse;
  artists: Artist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: External_ids;
  external_urls: External_urls;
  href: string;
  id: string;
  is_playable: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

interface Artist {
  external_urls: External_urls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

interface External_urls {
  spotify: string;
}

interface External_ids {
  isrc: string;
  ean: string;
  upc: string;
}
