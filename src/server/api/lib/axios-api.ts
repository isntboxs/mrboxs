import { AxiosError } from "axios";

import { spotifyInstance } from "@/server/api/lib/axios-instance";

import { GetCurrentlyPlayingTrack } from "@/types/spotify/get-currently-playing-track";

export const getNowPlayingApi = async (access_token: string) => {
  try {
    const response = await spotifyInstance.get<GetCurrentlyPlayingTrack>(
      "/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching now playing:", error.response?.data);
    } else {
      console.error("Unknown error fetching now playing:", error);
    }
    return null;
  }
};
