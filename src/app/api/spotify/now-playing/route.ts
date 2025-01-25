import { NextResponse } from "next/server";

import { getNowPlaying } from "@/lib/spotify/now-playing";

export const GET = async () => {
  return NextResponse.json(await getNowPlaying());
};
