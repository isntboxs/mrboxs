import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { nowPlayingQueryOptions } from '@/lib/spotify/query'

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

  const nowPlaying = useQuery(nowPlayingQueryOptions)

  useEffect(() => {
    const playback = nowPlaying.data
    const durationMs = playback?.item?.duration_ms ?? 0
    if (!playback || durationMs <= 0) {
      setTrackProgress(0)
      setElapsedTimeMs(0)
      return
    }

    const progressMs = Math.min(
      durationMs,
      Math.max(0, playback.progress_ms ?? 0),
    )
    setTrackProgress((progressMs / durationMs) * 100)
    setElapsedTimeMs(progressMs)
    if (!playback.is_playing) return

    const startedAt = Date.now()
    const interval = setInterval(() => {
      const elapsedMs = Math.min(
        durationMs,
        progressMs + Date.now() - startedAt,
      )
      setTrackProgress((elapsedMs / durationMs) * 100)
      setElapsedTimeMs(elapsedMs)
      if (elapsedMs >= durationMs) {
        clearInterval(interval)
        void queryClient.invalidateQueries({ queryKey: ['now-playing'] })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [nowPlaying.data, queryClient])

  return {
    trackProgress,
    elapsedTimeMs,
    nowPlaying,
  }
}
