"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import axios from "axios";
import { Loader2 } from "lucide-react";
import { FaSpotify } from "react-icons/fa";

import { GetCurrentlyPlayingTrack } from "@/types/spotify/get-currently-playing-track";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const NOW_PLAYING_ENDPOINT = "/api/spotify/now-playing";

const getNowPlaying = async () => {
  try {
    const res = await axios.get<GetCurrentlyPlayingTrack>(NOW_PLAYING_ENDPOINT);
    return res.data;
  } catch (err) {
    return console.error(err);
  }
};

// Helper function to format time in "00:00" format
const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const SpotifyNowPlayingSection = () => {
  const [trackProgress, setTrackProgress] = useState<number>(0);
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0);

  const { data, isLoading, isPending, refetch } = useQuery({
    queryKey: ["now-playing"],
    queryFn: getNowPlaying,
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (data && data.is_playing) {
      const progress_ms = data.progress_ms;
      const duration_ms = data.item.duration_ms;

      const initialProgress = (progress_ms / duration_ms) * 100;
      setTrackProgress(initialProgress);

      const initialElapsedTime = (progress_ms / duration_ms) * duration_ms;
      setElapsedTimeMs(initialElapsedTime);

      const interval = setInterval(() => {
        setTrackProgress((prevProgress) => {
          const newProgress = prevProgress + (1000 / duration_ms) * 100;

          if (newProgress >= 100) {
            clearInterval(interval);
            refetch();
            return 100;
          }

          return newProgress;
        });

        setElapsedTimeMs((prevElapse) => {
          const newElapsedTime = prevElapse + 1000;

          if (newElapsedTime >= duration_ms) {
            clearInterval(interval);
            return duration_ms;
          }

          return newElapsedTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [data, refetch]);

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="px-3">
        <NowPlayingHeader
          isLoading={isLoading}
          isPending={isPending}
          data={data}
        />
      </CardHeader>
      <CardContent className="px-3">
        {data && data.is_playing ? <NowPlayingContent {...data} /> : null}
      </CardContent>
      <CardFooter className="flex flex-row items-center justify-between gap-4 px-3">
        <p className="text-muted-foreground text-xs">
          {formatTime(elapsedTimeMs)}
        </p>
        <Progress value={trackProgress} className="h-1" />
        {data && data.is_playing ? (
          <p className="text-muted-foreground text-xs">
            {formatTime(data.item.duration_ms)}
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">{formatTime(0)}</p>
        )}
      </CardFooter>
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
          <p className="text-sm font-semibold">Loading...</p>
          <Loader2 className="text-muted-foreground size-4 animate-spin" />
        </>
      ) : data && data.is_playing ? (
        <>
          <h1 className="text-muted-foreground text-sm font-semibold">
            Listening to Spotify
          </h1>
          <FaSpotify className={cn("text-base text-green-500")} />
        </>
      ) : (
        <>
          <h1 className="text-muted-foreground text-sm font-semibold">
            Currently not playing Spotify
          </h1>
          <FaSpotify className={cn("text-muted-foreground text-base")} />
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
        <p className="text-muted-foreground line-clamp-1 text-sm">
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
          <p className="text-muted-foreground line-clamp-1 text-xs">
            playing on{" "}
            <Link
              href={props.context.external_urls.spotify}
              className="transition-all duration-300 ease-in-out hover:text-green-500 hover:underline hover:underline-offset-2"
            >
              {props.context.type}
            </Link>
          </p>
        ) : (
          <p className="text-muted-foreground line-clamp-1 text-xs">
            playing on track
          </p>
        )}
      </div>
    </div>
  );
};
