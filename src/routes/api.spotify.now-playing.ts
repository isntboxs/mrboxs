import { createFileRoute } from '@tanstack/react-router'
import { getNowPlaying } from '@/lib/spotify/now-playing'
import { SpotifyError } from '@/lib/spotify/error'

const responseHeaders = { 'Cache-Control': 'no-store' }

export const Route = createFileRoute('/api/spotify/now-playing')({
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
            error instanceof SpotifyError
              ? error
              : new SpotifyError(
                  'SPOTIFY_UNAVAILABLE',
                  'Spotify playback is temporarily unavailable.',
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
