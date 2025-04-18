import React from 'react';
import { useState, useEffect } from 'react';
import './App.css'
import Map from './components/Map';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
// import { Playlist } from './components/playlist';
import { Header } from './components/Header';
import tagService from './tagService';
import { NowPlaying } from './components/NowPlaying';
import spotifyService from './spotifyService';
import Login from './components/login';


function App() {

  const [position, setPosition] = useState([51.505, -0.09]);
  const [wasPaused, setWasPaused] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [tagList, setTagList] = useState([]);
  const [lastPlayedTrack, setLastPlayedTrack] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const track = playlist[currentTrack]
  const [authToken, setAuthToken] = useState('');

  // Webplayer
  const [player, setPlayer] = useState(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(null);
  const [device_id, setDeviceId] = useState('');
  const [isPaused, setIsPaused] = useState(true);


// UseEffect section

  useEffect(() => {
    tagService.getTags()
      .then(setTagList);

    spotifyService.getAccessToken()
      .then((accessToken) => {
        setAccessToken(accessToken);
      });

    spotifyService.getToken()
      .then((authToken) => {
        console.log(authToken)
        setAuthToken(authToken.access_token)
      });
    }, []);

    useEffect(() => {
      if (current_track && !is_paused) {
        // Check if this is a new track (not just resuming)
        if (lastPlayedTrack !== current_track.id) {
          addTag(current_track);
          setLastPlayedTrack(current_track.id);
        }
      }
    }, [current_track, is_paused]);

    useEffect(() => {
      if (authToken) {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
          const player = new window.Spotify.Player({
            name: 'Web Playback SDK',
            getOAuthToken: cb => {cb(authToken); },
            volume: 0.5
          });

          setPlayer(player);

          player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);

            fetch('https://api.spotify.com/v1/me/player', {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                device_ids: [device_id],
                play: false
              })
            });
          });

          player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
          });

          player.addListener('player_state_changed', (state) => {
            if (!state) return;
            setTrack(state.track_window.current_track);
            setPaused(state.paused);

            if (state.track_window.current_track) {
              setCurrentTrack(state.track_window.current_track);
            }

            player.getCurrentState().then(state => {
              (!state) ? setActive(false) : setActive(true);
            });
          });

          player.connect().then(success => {
            if (!success) {
              console.log('Failed to connect player');
            }
          });
        };
      }

      return () => {
        if (player) {
          player.disconnect();
        }
      };
  }, [authToken]);



  // Clickhandle section

  const handlePlay = () => {
    if (player) {
      player.resume().then(() => {
        setIsPaused(false);
        if (current_track) {
          addTag(current_track);
        }
      });
    }
  };

  const handlePause = () => {
    if (player) {
      player.pause().then(() => {
        setIsPaused(true);
        setWasPaused(true);
      });
    }
  };

  const handleNext = () => {
    if (player) {
      player.nextTrack().then(() => {
        setWasPaused(false);
      });
    }
  };

  const handlePrevious = () => {
    if (player) {
      player.previousTrack().then(() => {
        setWasPaused(false);
      });
    }
  };



  // Search section
  async function handleSearch() {
    const foundTracks = await spotifyService.searchSong(searchInput, accessToken);
    setTracks(foundTracks.tracks.items);
  }

  function handleTrackClick(track) {
    if (!track || !player) return;

    setPlaylist(prev => [...prev, track]);

    player._options.getOAuthToken(token => {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [track.uri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).catch(err => console.error('Error playing track:', err));
    });
  }



  // Tag system
  function addTag(track) {
    if (!track) return;

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    function success(pos) {
      const crd = pos.coords;
      const tagCoord = [crd.latitude, crd.longitude]
      console.log(tagCoord)
      setPosition(tagCoord)

      const newTag = {
        title: track.name,
        src: track.uri,
        artist: track.artists.map(a => a.name).join(', '),
        coordinates: tagCoord,
        timestamp: Date.now(),
      }

      tagService.addTag(newTag)
        .then(newTag => {
          setTagList((prevTagList) => ([...prevTagList, newTag]))
        })
        .catch(error => {
          console.log('Could not add a newTag', error)
        })
      console.log(tagList)
    }

    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }
    navigator.geolocation.getCurrentPosition(success, error, options);
  }


  // async function handleSearch() {
  //   const foundTracks = await spotifyService.searchSong(searchInput, accessToken)
  //   console.log(foundTracks);
  //   setTracks(foundTracks.tracks.items);
  // }

  // function handleTrackClick(newTrack) {
  //   if (newTrack) {
  //   setPlaylist((prevPlaylist) => ([...prevPlaylist, newTrack]))
  //   }
  // }

  return (
    <>
   <Header/>
    <Login />
   <div className="search">
        <div className="search-container">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="Search For Songs"
              type="text"
              onChange={event => setSearchInput(event.target.value)}
            />
            <button className="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        <div className="results-container">
          <div className="track-list">
            {tracks.map((track, i) => (
              <div className="track-item"
              key={i}
              onClick={() => handleTrackClick(track)}
              style={{cursor: 'pointer'}}>
                <img
                  src={track.album.images[0]?.url || "#"}
                  alt={track.name}
                  className="track-image"
                />
                <div className="track-info">
                  <h3 className="track-name">{track.name}</h3>
                  <p className="track-artists">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    <NowPlaying track={current_track || track || { name: "No track selected", artists: [{name: ""}] }} />
   <div className="container">
           <div className="main-wrapper">

            </div>
        </div>
    <div className='player'>
      {player && (
        <div className="player-controls">
          <button onClick={handlePrevious}>Previous</button>
          <button  onClick={isPaused ? handlePlay : handlePause}>
            {is_paused ? 'Play' : 'Pause'}
          </button>
          <button onClick={handleNext}>Next</button>
        </div>
      )}
      </div>
    <Map
    handleClick={addTag}
    position={position}
    tagList={tagList}/>
    </>
  )
}

export default App
