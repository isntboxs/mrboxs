import axios, { AxiosError } from "axios";
import qs from "query-string";

import { env } from "@/env";
import { GetAccessTokenResponse } from "@/types/spotify/get-access-token-response";

const client_id = env.SPOTIFY_CLIENT_ID;
const client_secret = env.SPOTIFY_CLIENT_SECRET;
const refresh_token = env.SPOTIFY_REFRESH_TOKEN;

const buffer = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const AUTH_PARAMS = qs.stringify({
  grant_type: "refresh_token",
  refresh_token,
});

export const getSpotifyAccessToken = async (): Promise<
  GetAccessTokenResponse | undefined
> => {
  try {
    const response = await axios.post(TOKEN_ENDPOINT, AUTH_PARAMS, {
      headers: {
        Authorization: `Basic ${buffer}`,
        "Content-Type": "application/x-www-form-urlencoded",
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
