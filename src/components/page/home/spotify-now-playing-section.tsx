"use client";

import Image from "next/image";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { FaSpotify } from "react-icons/fa";

import { GetCurrentlyPlayingTrack } from "@/types/spotify/get-currently-playing-track";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TextShimmer } from "@/components/ui/text-shimmer";

const NOW_PLAYING_ENDPOINT = "/api/spotify/now-playing";

const getNowPlaying = async () => {
  try {
    const res = await axios.get<GetCurrentlyPlayingTrack>(NOW_PLAYING_ENDPOINT);
    return res.data;
  } catch (err) {
    return console.error(err);
  }
};

export const SpotifyNowPlayingSection = () => {
  const { data, isLoading, isPending } = useQuery({
    queryKey: ["now-playing"],
    queryFn: getNowPlaying,
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  console.log({ data, isLoading, isPending });

  return (
    <Card className="border-none bg-foreground/5">
      <CardHeader className="p-3">
        <NowPlayingHeader
          isLoading={isLoading}
          isPending={isPending}
          data={data}
        />
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {data ? <NowPlayingContent {...data} /> : null}
      </CardContent>
    </Card>
  );
};

const NowPlayingHeader = ({
  isLoading,
  isPending,
  data,
}: {
  isLoading: boolean;
  isPending: boolean;
  data: GetCurrentlyPlayingTrack | undefined | void;
}) => {
  return (
    <div className="flex w-full flex-row items-center justify-between">
      {isLoading || isPending ? (
        <>
          <TextShimmer className="text-sm font-semibold" duration={1}>
            Loading...
          </TextShimmer>
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </>
      ) : !data ? (
        <>
          <h1 className="text-sm font-semibold text-muted-foreground">
            Currently not playing Spotify
          </h1>
          <FaSpotify className={cn("text-base text-muted-foreground")} />
        </>
      ) : (
        <>
          <h1 className="text-sm font-semibold text-muted-foreground">
            Listening to Spotify
          </h1>
          <FaSpotify className={cn("text-base text-green-500")} />
        </>
      )}
    </div>
  );
};

const NowPlayingContent = (props: GetCurrentlyPlayingTrack) => {
  return (
    <div className="flex items-center gap-4">
      <Image
        priority
        src={props.item.album.images[0].url}
        alt={props.item.album.name}
        width={props.item.album.images[0].width}
        height={props.item.album.images[0].height}
        className="h-16 w-16 rounded-md object-cover"
      />

      <div className="flex flex-1 flex-col justify-between">
        <p className="line-clamp-1">
          <Link
            href={props.item.external_urls.spotify}
            className="text-base font-semibold transition-all duration-300 ease-in-out hover:text-green-500 hover:underline hover:underline-offset-4"
          >
            {props.item.name}
          </Link>
        </p>
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {props.item.artists
            .map((artist) => {
              return (
                <Link
                  key={artist.id}
                  href={artist.external_urls.spotify}
                  className="transition-all duration-300 ease-in-out hover:text-green-500 hover:underline hover:underline-offset-4"
                >
                  {artist.name}
                </Link>
              );
            })
            .reduce((prev, curr) => {
              return (
                <>
                  {prev}
                  {", "}
                  {curr}
                </>
              );
            })}
        </p>

        {props.context ? (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            playing on{" "}
            <Link
              href={props.context.external_urls.spotify}
              className="transition-all duration-300 ease-in-out hover:text-green-500 hover:text-primary hover:underline hover:underline-offset-2"
            >
              {props.context.type}
            </Link>
          </p>
        ) : (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            playing on track
          </p>
        )}
      </div>
    </div>
  );
};
