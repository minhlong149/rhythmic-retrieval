import { getAccessToken, redirectToAuthCodeFlow } from "./spotifyPkceAuth.js";

async function requestAccessToken() {
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (!code) {
    await redirectToAuthCodeFlow(clientId);
  } else {
    return getAccessToken(clientId, code);
  }
}

async function searchForTrack(accessToken, trackName) {
  const params = new URLSearchParams();
  params.append("q", trackName);
  params.append("type", "track");

  const url = new URL("https://api.spotify.com/v1/search");
  url.search = params.toString();

  const result = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return result.json();
}
