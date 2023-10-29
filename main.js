import { getAccessToken, redirectToAuthCodeFlow } from "./spotifyPkceAuth.js";

import tracklist from "./chart.json";

const BASE_URL = "https://api.spotify.com/v1";

const SEARCH_PROPERTY = "name"; // <--- Change this to the property that contains the search query

(async function main() {
  const accessToken = await requestAccessToken();

  const data = await getAudioFeatures(accessToken, tracklist);
  console.log("📊", data);

  exportToCsv(data);
})();

async function requestAccessToken() {
  const clientId = import.meta.env.VITE_CLIENT_ID; // <--- Remember to add your client id to the .env file
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
  params.append("limit", 1);

  const url = new URL(`${BASE_URL}/search`);
  url.search = params.toString();

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const { tracks } = await response.json();
  return tracks.items[0];
}

async function getMetaData(accessToken, tracklist) {
  const metaData = [];

  for (const track of tracklist) {
    const content = await searchForTrack(accessToken, track[SEARCH_PROPERTY]);
    console.log("🔎", content);
    metaData.push({ ...track, ...extractMetaData(content) });
    await new Promise((resolve) => setTimeout(resolve, 200)); // Avoid rate limiting
  }

  return metaData;
}

function extractMetaData(track) {
  return {
    id: track.id,
    track_name: track.name,
    artists_name: track.artists
      .map((artist) => artist.name)
      .filter((name) => name != null)
      .join(";"),
    artists_follower: track.artists
      .map((artist) => artist.followers?.total)
      .filter((followers) => followers != null)
      .join(";"),
    artists_popularity: track.artists
      .map((artist) => artist.popularity)
      .filter((popularity) => popularity != null)
      .join(";"),
    artists_genres: track.artists
      .map((artist) => artist.genres?.join(","))
      .filter((genres) => genres != null)
      .join(";"),
    album_name: track.album.name,
    album_release_date: track.album.release_date,
    duration_ms: track.duration_ms,
    explicit: track.explicit,
    track_popularity: track.popularity,
  };
}

async function getAudioFeatures(accessToken, tracklist) {
  const metaData = await getMetaData(accessToken, tracklist);
  const spotifyIds = metaData.map((track) => track.id).join(",");

  const params = new URLSearchParams();
  params.append("ids", spotifyIds);

  const url = new URL(`${BASE_URL}/audio-features`);
  url.search = params.toString();

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const { audio_features } = await response.json();
  console.log("🔉", audio_features);

  return audio_features.map((track, trackIndex) => ({
    ...metaData[trackIndex],
    ...extractAudioFeatures(track),
  }));
}

function extractAudioFeatures(track) {
  return {
    acousticness: track.acousticness,
    danceability: track.danceability,
    energy: track.energy,
    instrumentalness: track.instrumentalness,
    key: track.key,
    liveness: track.liveness,
    loudness: track.loudness,
    mode: track.mode,
    speechiness: track.speechiness,
    tempo: track.tempo,
    time_signature: track.time_signature,
    valence: track.valence,
  };
}

function exportToCsv(data) {
  const header = Object.keys(data[0]).join(",");
  const rows = data.map((row) => Object.values(row).join(",")).join("\n");

  const csvContent = [header, rows].join("\n");
  download(csvContent);
}

function download(csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "audio-features.csv");
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
