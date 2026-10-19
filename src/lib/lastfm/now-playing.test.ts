import { afterEach, beforeEach, expect, it, vi } from 'vite-plus/test'

const config = vi.hoisted(() => ({
  LASTFM_USERNAME: 'MrBoxs',
  LASTFM_API_KEY: 'test-key',
}))
vi.mock('@/lib/env/server', () => ({ env: config }))

const fetchMock = vi.fn<typeof fetch>()
const track = {
  name: 'Test Track',
  artist: { '#text': 'Test Artist' },
  album: { '#text': 'Test Album' },
  image: [
    { '#text': 'https://example.com/small.jpg', size: 'small' },
    {
      '#text': 'https://lastfm-img.freetls.fastly.net/i/u/300x300/cover.jpg',
      size: 'extralarge',
    },
  ],
  url: 'https://www.last.fm/music/Test+Artist/_/Test+Track',
  '@attr': { nowplaying: 'true' },
}
const currentTrackResponse = () =>
  Response.json({ recenttracks: { track: [track] } })

beforeEach(() => {
  vi.resetModules()
  fetchMock.mockReset()
  config.LASTFM_USERNAME = 'MrBoxs'
  config.LASTFM_API_KEY = 'test-key'
  vi.stubGlobal('fetch', fetchMock)
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(0)
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('normalizes the current track and chooses the largest cover', async () => {
  fetchMock.mockResolvedValueOnce(currentTrackResponse())
  const { getNowPlaying } = await import('./now-playing')
  await expect(getNowPlaying()).resolves.toEqual({
    title: 'Test Track',
    artist: 'Test Artist',
    album: 'Test Album',
    artworkUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/cover.jpg',
    url: track.url,
  })
  const requestedUrl = new URL(new Request(fetchMock.mock.calls[0][0]).url)
  expect(requestedUrl.searchParams.get('method')).toBe('user.getrecenttracks')
  expect(requestedUrl.searchParams.get('user')).toBe('MrBoxs')
})

it('does not label a completed scrobble as live playback', async () => {
  fetchMock.mockResolvedValueOnce(
    Response.json({
      recenttracks: { track: [{ ...track, '@attr': undefined }] },
    }),
  )
  const { getNowPlaying } = await import('./now-playing')
  await expect(getNowPlaying()).resolves.toBeNull()
})

it('returns idle for an empty listening history', async () => {
  fetchMock.mockResolvedValueOnce(
    Response.json({ recenttracks: { track: [] } }),
  )
  const { getNowPlaying } = await import('./now-playing')
  await expect(getNowPlaying()).resolves.toBeNull()
})

it('accepts a single-track response with no artwork', async () => {
  fetchMock.mockResolvedValueOnce(
    Response.json({ recenttracks: { track: { ...track, image: [] } } }),
  )
  const { getNowPlaying } = await import('./now-playing')
  await expect(getNowPlaying()).resolves.toMatchObject({
    title: 'Test Track',
    artworkUrl: null,
  })
})

it('shares concurrent requests and caches results for only 15 seconds', async () => {
  fetchMock
    .mockResolvedValueOnce(currentTrackResponse())
    .mockResolvedValueOnce(Response.json({ recenttracks: { track: [] } }))
  const { getNowPlaying } = await import('./now-playing')
  await Promise.all([getNowPlaying(), getNowPlaying()])
  await getNowPlaying()
  expect(fetchMock).toHaveBeenCalledTimes(1)
  vi.setSystemTime(16_000)
  await expect(getNowPlaying()).resolves.toBeNull()
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

it('reports missing configuration without making a request', async () => {
  config.LASTFM_API_KEY = ''
  const { getNowPlaying } = await import('./now-playing')
  await expect(getNowPlaying()).rejects.toMatchObject({
    code: 'LASTFM_NOT_CONFIGURED',
  })
  expect(fetchMock).not.toHaveBeenCalled()
})

it.each([
  [10, 'LASTFM_INVALID_KEY'],
  [26, 'LASTFM_INVALID_KEY'],
  [6, 'LASTFM_INVALID_USER'],
  [29, 'LASTFM_RATE_LIMITED'],
])(
  'handles Last.fm error %i even when HTTP status is 200',
  async (error, code) => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ error, message: 'Provider error' }),
    )
    const { getNowPlaying } = await import('./now-playing')
    await expect(getNowPlaying()).rejects.toMatchObject({ code })
  },
)

it('sanitizes connection errors and avoids repeatedly hitting an unavailable service', async () => {
  fetchMock.mockRejectedValueOnce(
    new Error('Failed to fetch ?api_key=test-key'),
  )
  const { getNowPlaying } = await import('./now-playing')
  await expect(getNowPlaying()).rejects.toMatchObject({
    code: 'NOW_PLAYING_UNAVAILABLE',
    message: expect.not.stringContaining('test-key'),
  })
  await expect(getNowPlaying()).rejects.toMatchObject({
    code: 'NOW_PLAYING_UNAVAILABLE',
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

it('rejects malformed track data instead of crashing the card', async () => {
  fetchMock.mockResolvedValueOnce(
    Response.json({ recenttracks: { track: [{ name: 'Incomplete' }] } }),
  )
  const { getNowPlaying } = await import('./now-playing')
  await expect(getNowPlaying()).rejects.toMatchObject({
    code: 'NOW_PLAYING_UNAVAILABLE',
  })
})
