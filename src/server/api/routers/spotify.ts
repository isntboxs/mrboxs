import { TRPCError } from "@trpc/server";

import { getNowPlayingApi } from "@/server/api/lib/axios-api";
import { getAccessTokenWithRefreshToken } from "@/server/api/service/spotify-service";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const spotifyRouter = createTRPCRouter({
  nowPlaying: publicProcedure.query(async () => {
    const token = await getAccessTokenWithRefreshToken();

    if (!token) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get access token",
      });
    }

    const nowPlaying = getNowPlayingApi(token.access_token);

    return nowPlaying;
  }),
});
