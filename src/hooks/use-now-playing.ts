import { useQuery } from '@tanstack/react-query'
import { nowPlayingQueryOptions } from '@/lib/now-playing/query'

export const useNowPlaying = () => useQuery(nowPlayingQueryOptions)
