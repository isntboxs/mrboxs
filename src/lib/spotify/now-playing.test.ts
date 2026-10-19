import { afterEach, beforeEach, expect, it, vi } from 'vite-plus/test'

vi.mock('@/lib/env/server', () => ({
  env: {
    SPOTIFY_CLIENT_ID: 'test-client',
    SPOTIFY_CLIENT_SECRET: 'test-secret',
    SPOTIFY_REFRESH_TOKEN: 'test-refresh',
  },
}))

const fetchMock = vi.fn<typeof fetch>()
const tokenResponse = () =>
  Response.json({ access_token: 'test-access', expires_in: 3600 })

beforeEach(() => {
  vi.resetModules()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

it('returns an idle result for an empty playback response', async () => {
  fetchMock
    .mockResolvedValueOnce(tokenResponse())
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
  const { getNowPlaying } = await import('./now-playing')
  await expect(getNowPlaying()).resolves.toBeNull()
})

it('preserves the track payload and uses the bearer access token', async () => {
  const playback = {
    currently_playing_type: 'track',
    is_playing: true,
    item: { name: 'Test track', duration_ms: 180_000 },
    progress_ms: 12_000,
  }
  fetchMock
    .mockResolvedValueOnce(tokenResponse())
    .mockResolvedValueOnce(Response.json(playback))
  const { getNowPlaying } = await import('./now-playing')
  await expect(getNowPlaying()).resolves.toEqual(playback)
  expect(fetchMock.mock.calls[1][1]?.headers).toEqual({
    Authorization: 'Bearer test-access',
  })
})

it('does not send podcast data to a track-only card', async () => {
  fetchMock.mockResolvedValueOnce(tokenResponse()).mockResolvedValueOnce(
    Response.json({
      currently_playing_type: 'episode',
      item: { name: 'Podcast' },
    }),
  )
  const { getNowPlaying } = await import('./now-playing')
  await expect(getNowPlaying()).resolves.toBeNull()
})

it('refreshes a rejected access token once before retrying playback', async () => {
  fetchMock
    .mockResolvedValueOnce(tokenResponse())
    .mockResolvedValueOnce(new Response(null, { status: 401 }))
    .mockResolvedValueOnce(tokenResponse())
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
  const { getNowPlaying } = await import('./now-playing')
  await expect(getNowPlaying()).resolves.toBeNull()
  expect(fetchMock).toHaveBeenCalledTimes(4)
})

it('reports denied API access instead of pretending no music is playing', async () => {
  fetchMock
    .mockResolvedValueOnce(tokenResponse())
    .mockResolvedValueOnce(new Response(null, { status: 403 }))
  const { getNowPlaying } = await import('./now-playing')
  await expect(getNowPlaying()).rejects.toMatchObject({
    code: 'SPOTIFY_FORBIDDEN',
  })
})
