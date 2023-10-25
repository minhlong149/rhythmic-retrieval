# Rhythmic Retrieval

Retrieve metadata from Spotify content using the [Spotify Web API](https://developer.spotify.com/documentation/web-api/).

## Pre-requisites

To run this demo you will need:

- [Node.js LTS](https://nodejs.org/en/) environment
- [Spotify Developer Account](https://developer.spotify.com/)

## Usage

Create a new app in your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard). This will give you a client ID.

Add a redirect URI to the app settings. This should be the URL of the server you will be running the app on, followed by `/callback`. For example, if you are running the app on `localhost:5173`, the redirect URI should be `http://localhost:5173/callback`.

Clone this repository, ensure that you add `VITE_CLIENT_ID` and `VITE_REDIRECT_URI` to your `.env` file, and run the following commands:

```bash
npm install
npm run dev
```

## References

- [Authorization Code with PKCE Flow
](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
)
