
# SongTrail

SongTrail is the web app that charts your music-listening history in real time and pin it on a map.
- Play Spotify tracks seamlessly within the app.
- Automatically record your location when a song plays.
- View your personal music map, with connected markers tracing your listening journey.

Functionnalities to implement in future versions:
- Authentication Token refresh (60 min limit at the moment)
- Queue
- Playlists
- Trails history
- Start songs with tags
- Extensive listening datas
- Concert recommendations
- Friend system
- Android/iOS version

Please note that the documentation from Spotify for their APIs is pretty outdated (Checked on April 2025).


## Tech Stack

**Client:** React, Vite, Leaflet

**Server:** Node, Express, MongoDB, Mongoose

**API:** Spotify Web Playback SDK, Spotify Web API

**Important:** A Spotify premium membership and Spotify Dev account are required.

## Installation

- Install dependencies.

**Spotify Dev Website:**

- Create a [Spotify Dev Account](https://developer.spotify.com/dashboard) and enter your app name and description.

- Add http://127.0.0.1:3000/auth/callback to your Redirect URIs.

**Project files:**

- Update the .env.example variables in /server folder with your Spotify Client ID and Spotify Client Secret and use them in your .env file.







## Usage/Examples

1. Run ```npm run dev``` in the /client folder
1. Run ```nodemon index.js``` in the /server/ folder
1. On the landing page, proceed past any certificate warning (safe in local development), allow location access, and log in to Spotify.
1. If you're not already playing music on another device, search for a song using the search box and click the magnifying glass icon. (Use the “X” button to clear the search.)
1. Click on a song to start playback. A pin will appear on the map, and the view will automatically center on it.
1. Play additional songs to generate new pins, each connected to the previous one by a line.
1. Click on a pin (tag) to view the metadata attached to that listening point.

## Documentation

[Spotify Web API](https://developer.spotify.com/documentation/web-api)

[Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk) (pretty outdated)

[Spotify Dev Account](https://developer.spotify.com/dashboard)

[Leaflet API](https://leafletjs.com/reference.html)

[React-Leaflet](https://react-leaflet.js.org/)


## Authors

- [@eric-gebus](https://www.github.com/-eric-gebus)


## Screenshots

<div style="display: flex; gap: 40px; justify-content: center;">
  <img src="/client/src/screenshots/pin.png?raw=true" width="300" alt="Pin View" />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="/client/src/screenshots/trail.png?raw=true" width="300" alt="Pin View" />
</div>
