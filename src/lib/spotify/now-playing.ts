import axios, { AxiosError } from "axios";

import { GetCurrentlyPlayingTrack } from "@/types/spotify/get-currently-playing-track";
import { getSpotifyAccessToken } from "@/lib/spotify/access-token";

const BASE_URL = "https://api.spotify.com/v1/me/player/currently-playing";

export const getNowPlaying = async (): Promise<
  GetCurrentlyPlayingTrack | undefined
> => {
  try {
    const token = await getSpotifyAccessToken();

    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token?.access_token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(error.response?.data);
    } else {
      console.error(error);
    }
  }
};
