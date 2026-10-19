import { QueryClient } from '@tanstack/react-query'
import { afterEach, beforeEach, expect, it, vi } from 'vite-plus/test'
import { fetchNowPlaying, nowPlayingQueryOptions } from './query'

vi.mock('@/lib/env/client', () => ({
  env: { VITE_APP_URL: 'http://localhost:3000' },
}))

const fetchMock = vi.fn<typeof fetch>()
beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

it('treats HTTP 204 as idle without attempting JSON parsing', async () => {
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
  await expect(fetchNowPlaying()).resolves.toBeNull()
})

it('propagates the server configuration error without automatic retries', async () => {
  fetchMock.mockResolvedValueOnce(
    Response.json(
      {
        code: 'LASTFM_INVALID_KEY',
        error: 'Check the Last.fm API key.',
      },
      { status: 503 },
    ),
  )
  const queryClient = new QueryClient()
  try {
    await expect(
      queryClient.fetchQuery(nowPlayingQueryOptions),
    ).rejects.toMatchObject({ code: 'LASTFM_INVALID_KEY' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  } finally {
    queryClient.clear()
  }
})

it('uses the current browser origin and passes cancellation through', async () => {
  vi.stubGlobal('window', {})
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
  const controller = new AbortController()
  await fetchNowPlaying(controller.signal)
  expect(fetchMock).toHaveBeenCalledWith('/api/now-playing', {
    signal: controller.signal,
  })
})
