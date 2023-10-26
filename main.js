import { getAccessToken, redirectToAuthCodeFlow } from "./spotifyPkceAuth.js";

import { tracklist } from "./chart.json";

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
  return Promise.all(
    tracklist.map(async (track) => {
      const content = await searchForTrack(accessToken, track[SEARCH_PROPERTY]);
      console.log("🔎", content);
      const metaData = toMetaData(content);
      return { ...track, ...metaData };
    })
  );
}

function toMetaData(track) {
  return {
    id: track.id,
    track_name: track.name,
    artists_name: track.artists
      .map((artist) => artist.name)
      .filter((content) => content != null)
      .join(";"),
    artists_follower: track.artists
      .map((artist) => artist.followers?.total)
      .filter((content) => content != null)
      .join(";"),
    artists_popularity: track.artists
      .map((artist) => artist.popularity)
      .filter((content) => content != null)
      .join(";"),
    artists_genres: track.artists
      .map((artist) => artist.genres?.join(","))
      .filter((content) => content != null)
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

  return audio_features.map((audioFeature, trackIndex) => {
    const selectedFeatures = getFeatures(audioFeature);
    return { ...metaData[trackIndex], ...selectedFeatures };
  });
}

function getFeatures(audioFeature) {
  return {
    acousticness: audioFeature.acousticness,
    danceability: audioFeature.danceability,
    energy: audioFeature.energy,
    instrumentalness: audioFeature.instrumentalness,
    key: audioFeature.key,
    liveness: audioFeature.liveness,
    loudness: audioFeature.loudness,
    mode: audioFeature.mode,
    speechiness: audioFeature.speechiness,
    tempo: audioFeature.tempo,
    time_signature: audioFeature.time_signature,
    valence: audioFeature.valence,
  };
}

function exportToCsv(data) {
  const header = Object.keys(data[0]).join(",");
  const rows = data.map((row) => Object.values(row).join(",")).join("\n");

  const csvContent = [header, rows].join("\n");
  download(csvContent);
}

function download(content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "audio-features.csv");
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
