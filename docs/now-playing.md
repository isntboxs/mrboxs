# Now playing with Last.fm

The card reads the site's owner's current track from Last.fm. Connect Spotify
using **Spotify Scrobbling** in [Last.fm's application settings](https://www.last.fm/settings/applications).
Spotify Premium and a Spotify Developer app are not required for this integration.

## Configuration

1. Create an [API account/key](https://www.last.fm/api/account/create).
2. Set `LASTFM_USERNAME=MrBoxs` and `LASTFM_API_KEY=your-key` in `.env`.
3. Restart the dev server with `vp run dev`.
4. Play a song on Spotify. Check your Last.fm profile shows **Scrobbling now**.

Only the API key is used; the Last.fm shared secret and Spotify tokens are not
needed. Keep the API key on the server, without a `VITE_` prefix. On deployment,
set the same variables in the hosting provider's environment settings.

## Behavior

`GET /api/now-playing` returns the current track's title, artist, album, artwork,
and Last.fm track URL. The card appears only when Last.fm marks the track
`nowplaying=true`; a completed scrobble is listening history and does not appear
as live playback. No active track returns HTTP 204. Configuration or upstream
failures return HTTP 503 with a safe error code and message.

The server shares requests and caches results for 15 seconds. The browser polls
every 30 seconds, with slower recovery for temporary errors and no interval
polling for invalid configuration. Last.fm can lag behind Spotify. Its recent
tracks API has no playback position, so the card shows **Listening now** with
track details instead of a progress timer.

References: [Last.fm recent tracks API](https://www.last.fm/api/show/user.getRecentTracks),
[Spotify scrobbling support](https://support.last.fm/t/spotify-scrobbling/189).
