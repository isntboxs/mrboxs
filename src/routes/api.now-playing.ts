import { createFileRoute } from '@tanstack/react-router'
import { getNowPlaying } from '@/lib/lastfm/now-playing'
import { NowPlayingError } from '@/lib/now-playing/error'

const responseHeaders = { 'Cache-Control': 'no-store' }

export const Route = createFileRoute('/api/now-playing')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const data = await getNowPlaying()
          if (!data) {
            return new Response(null, { status: 204, headers: responseHeaders })
          }
          return Response.json(data, { headers: responseHeaders })
        } catch (error) {
          const failure =
            error instanceof NowPlayingError
              ? error
              : new NowPlayingError(
                  'NOW_PLAYING_UNAVAILABLE',
                  'Now playing is temporarily unavailable.',
                )
          return Response.json(
            { code: failure.code, error: failure.message },
            { status: 503, headers: responseHeaders },
          )
        }
      },
    },
  },
})
