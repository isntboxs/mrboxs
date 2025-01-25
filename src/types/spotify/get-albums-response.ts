import { GetTrackResponse } from "@/types/spotify/get-track-response";

export interface GetAlbumsResponse {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Images[];
  name: string;
  release_date: string;
  release_date_precision: string;
  type: string;
  uri: string;
  artists: Artists[];
  tracks: GetTrackResponse[];
}

interface ExternalUrls {
  spotify: string;
}

interface Images {
  height: number;
  url: string;
  width: number;
}

interface Artists {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}
