import { createFileRoute } from '@tanstack/react-router'
import { getNowPlaying } from '@/lib/spotify/now-playing'

export const Route = createFileRoute('/api/spotify/now-playing')({
  server: {
    handlers: {
      GET: async () => {
        const data = await getNowPlaying()
        if (!data) {
          return new Response(null, { status: 204 })
        }
        return Response.json(data)
      },
    },
  },
})
