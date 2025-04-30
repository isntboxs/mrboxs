import axios, { AxiosError } from "axios";
import qs from "query-string";

import { env } from "@/env";

import { GetAccessTokenResponse } from "@/types/spotify/get-access-token-response";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

// Cache for storing tokens
interface TokenCache {
  token: GetAccessTokenResponse | Omit<GetAccessTokenResponse, "refresh_token">;
  expiresAt: number;
}

// Separate caches for different token types
let refreshTokenCache: TokenCache | null = null;
let clientCredentialsCache: TokenCache | null = null;

/**
 * Get Spotify access token using refresh token flow
 * Checks cache first and only requests a new token if needed
 * @returns Promise with access token response or undefined
 */
export const getAccessTokenWithRefreshToken = async (): Promise<
  GetAccessTokenResponse | undefined
> => {
  try {
    // Check if we have a valid cached token
    const now = Date.now();
    if (refreshTokenCache && refreshTokenCache.expiresAt > now) {
      return refreshTokenCache.token as GetAccessTokenResponse;
    }

    // No valid token in cache, request a new one
    const client_id = env.SPOTIFY_CLIENT_ID;
    const client_secret = env.SPOTIFY_CLIENT_SECRET;
    const refresh_token = env.SPOTIFY_REFRESH_TOKEN;

    const buffer = Buffer.from(`${client_id}:${client_secret}`).toString(
      "base64",
    );

    const params = qs.stringify({
      grant_type: "refresh_token",
      refresh_token,
    });

    const response = await axios.post(TOKEN_ENDPOINT, params, {
      headers: {
        Authorization: `Basic ${buffer}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const tokenData = response.data as GetAccessTokenResponse;

    // Cache the token with expiration time (subtract 60 seconds as safety margin)
    refreshTokenCache = {
      token: tokenData,
      expiresAt: now + (tokenData.expires_in - 60) * 1000,
    };

    return tokenData;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error refreshing Spotify token:", error.response?.data);
    } else {
      console.error("Unknown error refreshing Spotify token:", error);
    }
    return undefined;
  }
};

/**
 * Get Spotify access token using client credentials flow
 * This flow doesn't provide access to user-specific data
 * Checks cache first and only requests a new token if needed
 * @returns Promise with access token response or undefined
 */
export const getAccessTokenWithClientCredentials = async (): Promise<
  Omit<GetAccessTokenResponse, "refresh_token"> | undefined
> => {
  try {
    // Check if we have a valid cached token
    const now = Date.now();
    if (clientCredentialsCache && clientCredentialsCache.expiresAt > now) {
      return clientCredentialsCache.token as Omit<
        GetAccessTokenResponse,
        "refresh_token"
      >;
    }

    // No valid token in cache, request a new one
    const client_id = env.SPOTIFY_CLIENT_ID;
    const client_secret = env.SPOTIFY_CLIENT_SECRET;

    const buffer = Buffer.from(`${client_id}:${client_secret}`).toString(
      "base64",
    );

    const params = qs.stringify({
      grant_type: "client_credentials",
    });

    const response = await axios.post(TOKEN_ENDPOINT, params, {
      headers: {
        Authorization: `Basic ${buffer}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const tokenData = response.data as Omit<
      GetAccessTokenResponse,
      "refresh_token"
    >;

    // Cache the token with expiration time (subtract 60 seconds as safety margin)
    clientCredentialsCache = {
      token: tokenData,
      expiresAt: now + (tokenData.expires_in - 60) * 1000,
    };

    return tokenData;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error getting Spotify client credentials:",
        error.response?.data,
      );
    } else {
      console.error("Unknown error getting Spotify client credentials:", error);
    }
    return undefined;
  }
};

/**
 * Clear all token caches
 * Useful for testing or when you need to force new token requests
 */
export const clearTokenCaches = (): void => {
  refreshTokenCache = null;
  clientCredentialsCache = null;
};
