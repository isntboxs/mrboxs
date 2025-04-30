import axios from "axios";

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

export const spotifyInstance = axios.create({
  baseURL: SPOTIFY_API_BASE_URL,
});
