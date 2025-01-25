"use client";

import Image from "next/image";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FaSpotify } from "react-icons/fa";

import { GetCurrentlyPlayingTrack } from "@/types/spotify/get-currently-playing-track";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
  });

  console.log({ data, isLoading, isPending });

  return (
    <Card className="border-none bg-foreground/5">
      <CardHeader className="flex w-full flex-row items-center justify-between p-3">
        <h1 className="text-sm font-semibold text-muted-foreground">
          Listening to Spotify
        </h1>
        <FaSpotify className={cn("text-base text-green-500")} />
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {data ? (
          <div className="flex items-center gap-4">
            <Link href={data.item.album.external_urls.spotify}>
              <Image
                priority
                src={data.item.album.images[0].url}
                alt={data.item.album.name}
                width={data.item.album.images[0].width}
                height={data.item.album.images[0].height}
                className="h-16 w-16 rounded-md object-cover"
              />
            </Link>

            <div className="flex flex-1 flex-col justify-between">
              <p className="line-clamp-1">
                <Link
                  href={data.item.external_urls.spotify}
                  className="text-base font-semibold transition-all duration-300 ease-in-out hover:text-muted-foreground hover:underline hover:decoration-green-500 hover:underline-offset-4"
                >
                  {data.item.name}
                </Link>
              </p>
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {data.item.artists
                  .map((artist) => {
                    return (
                      <Link
                        key={artist.id}
                        href={artist.external_urls.spotify}
                        className="transition-all duration-300 ease-in-out hover:text-primary hover:underline hover:decoration-green-500 hover:underline-offset-4"
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

              {data.context ? (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  playing on{" "}
                  <Link
                    href={data.context.external_urls.spotify}
                    className="transition-all duration-300 ease-in-out hover:text-primary hover:underline hover:decoration-green-500 hover:underline-offset-2"
                  >
                    {data.context.type}
                  </Link>
                </p>
              ) : (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  playing on track
                </p>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
