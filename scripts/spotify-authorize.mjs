import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'

const redirectUri = 'http://127.0.0.1:8888/callback'

if (process.argv.includes('--help')) {
  console.info(`Reconnect Spotify for the now-playing card.

1. The Development Mode app owner needs Spotify Premium.
2. Add ${redirectUri} to the app's Redirect URIs in the Spotify Developer Dashboard.
3. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.
4. Run vp run spotify:authorize and open the printed login URL.

Only user-read-currently-playing is requested. The new refresh token is saved
directly to .env and is never printed. Restart the app after reconnecting.`)
  process.exit(0)
}

const clientId = process.env.SPOTIFY_CLIENT_ID?.trim()
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim()
if (!clientId || !clientSecret) {
  console.error(
    'Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env first.',
  )
  process.exit(1)
}

const state = randomBytes(32).toString('hex')
const authorizationUrl = new URL('https://accounts.spotify.com/authorize')
authorizationUrl.search = new URLSearchParams({
  client_id: clientId,
  response_type: 'code',
  redirect_uri: redirectUri,
  scope: 'user-read-currently-playing',
  state,
  show_dialog: 'true',
}).toString()

let exchanging = false
const server = createServer(async (request, response) => {
  response.setHeader('Content-Type', 'text/plain; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Referrer-Policy', 'no-referrer')
  const url = new URL(request.url ?? '/', redirectUri)
  if (request.method !== 'GET' || url.pathname !== '/callback') {
    response.writeHead(404).end('Not found.')
    return
  }
  if (url.searchParams.get('state') !== state) {
    response
      .writeHead(400)
      .end(
        'Invalid authorization state. Use the login URL printed in the terminal.',
      )
    return
  }
  const code = url.searchParams.get('code')
  if (!code || url.searchParams.has('error')) {
    response
      .writeHead(400)
      .end('Spotify authorization was not completed. Run the command again.')
    finish(1)
    return
  }
  if (exchanging) {
    response.writeHead(409).end('Authorization is already being completed.')
    return
  }
  exchanging = true

  try {
    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    )
    const data = await tokenResponse.json()
    if (!tokenResponse.ok || typeof data.refresh_token !== 'string') {
      throw new Error(
        'Spotify rejected the authorization. Check the app credentials and redirect URI, then run the command again.',
      )
    }

    // Read again after login so other .env edits made while waiting are preserved.
    const envPath = new URL('../.env', import.meta.url)
    const contents = await readFile(envPath, 'utf8')
    const tokenLine = `SPOTIFY_REFRESH_TOKEN=${JSON.stringify(data.refresh_token)}`
    const pattern = /^(?:export\s+)?SPOTIFY_REFRESH_TOKEN\s*=.*$/m
    const updated = pattern.test(contents)
      ? contents.replace(pattern, () => tokenLine)
      : `${contents.trimEnd()}\n${tokenLine}\n`
    await writeFile(envPath, updated, { mode: 0o600 })

    response.end(
      'Spotify connected. The refresh token was saved to .env. Restart the app and play a song on Spotify.',
    )
    console.info(
      'Spotify connected. Updated SPOTIFY_REFRESH_TOKEN in .env. Restart the app.',
    )
    finish(0)
  } catch {
    const message =
      'Could not reconnect Spotify. Check the app credentials, redirect URI, and network, then run the command again.'
    response.writeHead(502).end(message)
    console.error(message)
    finish(1)
  }
})

const timeout = setTimeout(() => {
  console.error(
    'Spotify authorization timed out. Run the command again when ready.',
  )
  finish(1)
}, 5 * 60_000)

function finish(exitCode) {
  clearTimeout(timeout)
  process.exitCode = exitCode
  server.close()
}

server.on('error', () => {
  console.error(
    'Could not listen on 127.0.0.1:8888. Close the process using that port and try again.',
  )
  finish(1)
})
server.listen(8888, '127.0.0.1', () => {
  console.info(
    `First register this exact Redirect URI in your Spotify app: ${redirectUri}`,
  )
  console.info(
    `Open this URL and sign in to the Spotify account to display:\n${authorizationUrl}`,
  )
})
