import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

vi.mock('@/lib/env/server', () => ({
  env: {
    SPOTIFY_CLIENT_ID: 'test-client',
    SPOTIFY_CLIENT_SECRET: 'test-secret',
    SPOTIFY_REFRESH_TOKEN: 'test-refresh',
  },
}))

const fetchMock = vi.fn<typeof fetch>()
const tokenResponse = (accessToken = 'test-access', refreshToken?: string) =>
  Response.json({
    access_token: accessToken,
    expires_in: 3600,
    ...(refreshToken ? { refresh_token: refreshToken } : {}),
  })

beforeEach(() => {
  vi.resetModules()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(0)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Spotify token refresh', () => {
  it('shares concurrent requests and reuses the unexpired access token', async () => {
    fetchMock.mockResolvedValueOnce(tokenResponse())
    const { getSpotifyAccessToken } = await import('./access-token')

    await expect(
      Promise.all([getSpotifyAccessToken(), getSpotifyAccessToken()]),
    ).resolves.toEqual(['test-access', 'test-access'])
    await expect(getSpotifyAccessToken()).resolves.toBe('test-access')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const request = fetchMock.mock.calls[0][1]
    const body = request?.body
    expect(body).toBeInstanceOf(URLSearchParams)
    expect(body instanceof URLSearchParams && body.toString()).toBe(
      'grant_type=refresh_token&refresh_token=test-refresh',
    )
  })

  it('refreshes before expiry and uses a rotated refresh token', async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse('first-access', 'rotated-refresh'))
      .mockResolvedValueOnce(tokenResponse('second-access'))
    const { getSpotifyAccessToken } = await import('./access-token')
    await getSpotifyAccessToken()
    vi.setSystemTime(3_541_000)

    await expect(getSpotifyAccessToken()).resolves.toBe('second-access')
    const body = fetchMock.mock.calls[1][1]?.body
    expect(body instanceof URLSearchParams && body.toString()).toContain(
      'refresh_token=rotated-refresh',
    )
  })

  it('reports revoked authorization without leaking provider details or repeatedly refreshing', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json(
        {
          error: 'invalid_grant',
          error_description: 'test-refresh was revoked',
        },
        { status: 400 },
      ),
    )
    const { getSpotifyAccessToken } = await import('./access-token')

    await expect(getSpotifyAccessToken()).rejects.toMatchObject({
      code: 'SPOTIFY_REAUTH_REQUIRED',
      message: expect.not.stringContaining('test-refresh'),
    })
    await expect(getSpotifyAccessToken()).rejects.toMatchObject({
      code: 'SPOTIFY_REAUTH_REQUIRED',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    vi.setSystemTime(61_000)
    fetchMock.mockResolvedValueOnce(tokenResponse())
    await expect(getSpotifyAccessToken()).resolves.toBe('test-access')
  })

  it('distinguishes invalid app credentials from a revoked token', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ error: 'invalid_client' }, { status: 400 }),
    )
    const { getSpotifyAccessToken } = await import('./access-token')
    await expect(getSpotifyAccessToken()).rejects.toMatchObject({
      code: 'SPOTIFY_INVALID_CLIENT',
    })
  })

  it('sanitizes connection errors', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network failure test-secret'))
    const { getSpotifyAccessToken } = await import('./access-token')
    await expect(getSpotifyAccessToken()).rejects.toMatchObject({
      code: 'SPOTIFY_UNAVAILABLE',
      message: expect.not.stringContaining('test-secret'),
    })
  })
})
