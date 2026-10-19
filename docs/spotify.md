# Spotify now playing

The card uses Spotify's `GET /v1/me/player/currently-playing` API. Only the
Spotify account connected by the site owner is displayed; site visitors do not
need Spotify accounts.

For an app in **Development Mode**, Spotify currently requires the **app owner
to have Premium**. The connected account must also be on the app's user allowlist
and grant `user-read-currently-playing`.

## Reconnect the Spotify account

An `invalid_grant` / `Refresh token revoked` response means the old refresh token
cannot be reused. Premium alone will not restore it: authorize the account again.

1. Open the app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Under Settings, add this exact Redirect URI: `http://127.0.0.1:8888/callback`.
3. Check `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `.env` against that app.
4. Run `vp run spotify:authorize` and open the login URL printed in the terminal.
5. Sign in to the account whose music should be displayed and approve access.
6. The command writes `SPOTIFY_REFRESH_TOKEN` directly to `.env` without printing it.
7. Restart `vp run dev`, then play a song in Spotify and reload the site.

For deployment, also update the hosting provider's `SPOTIFY_REFRESH_TOKEN` secret
and restart/redeploy. Never add client secrets or refresh tokens to `VITE_`
variables or commit `.env`.

The helper listens only on the local loopback interface and exits after one
authorization or five minutes. Run it on the same computer as the login browser.

## Responses

- `200`: a supported track, including paused tracks.
- `204`: no current track, an advertisement, or an unsupported episode.
- `503` with `SPOTIFY_REAUTH_REQUIRED`: reconnect the account.
- `503` with `SPOTIFY_INVALID_CLIENT`: check the app's client ID and secret.
- `503` with `SPOTIFY_FORBIDDEN`: check Premium, the allowlist, and the granted scope.
- Other `503` responses: a temporary connection, Spotify availability, or quota problem.

The server caches access tokens until shortly before expiry. The client treats
empty responses as idle and stops polling for authorization/configuration errors.

References:

- [Spotify quota modes and Premium requirement](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
- [Refreshing tokens and invalid grants](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens)
- [Redirect URI requirements](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri)
