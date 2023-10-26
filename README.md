# Rhythmic Retrieval

Retrieve metadata from Spotify content using the [Spotify Web API](https://developer.spotify.com/documentation/web-api/).

## Pre-requisites

To run this demo you will need:

- [Node.js LTS](https://nodejs.org/en/) environment
- [Spotify Developer Account](https://developer.spotify.com/)

## Usage

Create a new app in your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard). This will give you a client ID.

Add a redirect URI to the app settings. This should be the URL of the server you will be running the app on, followed by `/callback`. For example, if you are running the app on `localhost:5173`, the redirect URI should be `http://localhost:5173/callback`.

Clone this repository, ensure that you add `VITE_CLIENT_ID` and `VITE_REDIRECT_URI` to your `.env` file.

Then run the following commands:

```bash
npm install
npm run dev
```

Before running the project, please **make sure to add your desired songs** to the `chart.json` file at the root directory. This file is a JSON file that contains a list of songs that will be used to retrieve the metadata from Spotify.

```json
{
  "tracklist": [
    {
      "name": "Never Gonna Give You Up",
      // Other track data here
    }
  ]
}
```

Each object in the `tracklist` array should have a property (e.g. `name`) that contains the search query for the song.

## References

- [Authorization Code with PKCE Flow
](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
)
