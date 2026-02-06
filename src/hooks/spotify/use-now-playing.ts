import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { GetCurrentlyPlayingTrack } from '@/types/spotify/get-currently-playing-track'
import { env } from '@/lib/env/client'

// Helper function to format time in "00:00" format
export const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const useNowPlaying = () => {
  const [trackProgress, setTrackProgress] = useState<number>(0)
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0)

  const queryClient = useQueryClient()

  const nowPlaying = useQuery({
    queryKey: ['now-playing'],
    queryFn: async () => {
      const res = await fetch(`${env.VITE_APP_URL}/api/spotify/now-playing`)
      return res.json() as Promise<GetCurrentlyPlayingTrack>
    },
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (nowPlaying.data?.is_playing) {
      const progress_ms = nowPlaying.data.progress_ms
      const duration_ms = nowPlaying.data.item.duration_ms

      const initialProgress = (progress_ms / duration_ms) * 100
      setTrackProgress(initialProgress)

      const initialElapsedTime = (progress_ms / duration_ms) * duration_ms
      setElapsedTimeMs(initialElapsedTime)

      const interval = setInterval(() => {
        setTrackProgress((prevProgress) => {
          const newProgress = prevProgress + (1000 / duration_ms) * 100

          if (newProgress >= 100) {
            clearInterval(interval)
            void queryClient.invalidateQueries({ queryKey: ['now-playing'] })
            return 100
          }

          return newProgress
        })

        setElapsedTimeMs((prevElapse) => {
          const newElapsedTime = prevElapse + 1000

          if (newElapsedTime >= duration_ms) {
            clearInterval(interval)
            return duration_ms
          }

          return newElapsedTime
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [nowPlaying.data, queryClient])

  return {
    trackProgress,
    elapsedTimeMs,
    nowPlaying,
  }
}
