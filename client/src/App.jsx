import React from 'react';
import { useState, useEffect } from 'react';
import './App.css'
import Map from './components/Map';
import { Header } from './components/Header';
import tagService from './tagService';
import { NowPlaying } from './components/NowPlaying';
import spotifyService from './spotifyService';
import Login from './components/login';
import playIcon from "./assets/player/play-button.png"
import pauseIcon from "./assets/player/pause-button.png"
import previousIcon from "./assets/player/previous-button.png"
import nextIcon from "./assets/player/next-button.png"
import cancel from "./assets/cancel-button.png";
import search from "./assets/search-button.png";

function App() {

  // Geolocation + Tags
  const [position, setPosition] = useState([51.505, -0.09]);
  const [tagList, setTagList] = useState([]);

  //Search UI
  const [searchInput, setSearchInput] = useState("");
  const [tracks, setTracks] = useState([]);
  const [showResults, setShowResults] = useState(true);

  //Spotify Auth
  const [accessToken, setAccessToken] = useState("");
  const [authToken, setAuthToken] = useState('');

  // Webplayer
  const [player, setPlayer] = useState(undefined);
  const [current_track, setTrack] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [lastPlayedTrack, setLastPlayedTrack] = useState(null);
  const [device_id, setDeviceId] = useState('');


// UseEffect section

  useEffect(() => {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    const success = (pos) => {
      const crd = pos.coords;
      setPosition([crd.latitude, crd.longitude]);
    };

    const error = (err) => {
      console.warn(`ERROR(${err.code}): ${err.message}`);
      // Fallback to default position if geolocation fails
      setPosition([51.505, -0.09]);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);

    tagService.getTags()
      .then(setTagList);

    spotifyService.getAccessToken()
      .then((accessToken) => {
        setAccessToken(accessToken);
      });

    spotifyService.getAuthToken()
      .then((authToken) => {
        console.log(authToken)
        setAuthToken(authToken.access_token)
      });
    }, []);

    useEffect(() => {
      if (current_track && !isPaused) {

        if (lastPlayedTrack !== current_track.id) {
          addTag(current_track);
          setLastPlayedTrack(current_track.id);
        }
      }
    }, [current_track, isPaused,]);

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
            setDeviceId(device_id);

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
            if (!state) {
              setTrack(null);  // No active track
              return;
            }
            setTrack(state.track_window.current_track);
            setIsPaused(state.paused);
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
      });
    }
  };

  const handleNext = () => {
    if (player) {
      player.nextTrack().then(() => {
      });
    }
  };

  const handlePrevious = () => {
    if (player) {
      player.previousTrack().then(() => {
      });
    }
  };



  // Search section
  async function handleSearch() {
    const foundTracks = await spotifyService.searchSong(searchInput, accessToken);
    setTracks(foundTracks.tracks.items);
    setShowResults(true);
  }

  function handleCancel() {
    setSearchInput("");
    setShowResults(false);
  }

  function handleTrackClick(track) {
    if (!player || !authToken) return;

    setShowResults(false);

    // Transfer playback to your Web Playback SDK device
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: [track.uri],
        position_ms: 0
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to play track');
      }
      console.log('Track started playing');
      setTrack(track);
      setIsPaused(false);
    })
    .catch(error => {
      console.error('Error playing track:', error);
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



  return (
    <>
   {!authToken && (
      <Login/>
   )}

  {authToken && (
    <>
    <Header/>
    <div className='overall'>
    <div className="search">
        <div className="search-container">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="What do you want to listen to?"
              type="text"
              value={searchInput}
              onChange={event => setSearchInput(event.target.value)}
              />
            <button className="search-button" onClick={handleSearch}>
              <img src={search}
              width="25px"
              length="25px"/>
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              <img
              src={cancel}
              width="25px"
              length="25px"
              />
            </button>
          </div>
        </div>
      {showResults && (
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
      )}
      </div>

    <div className='radio'>
    <NowPlaying track={current_track || { name: "No track selected", artists: [{name: ""}] }} />
   <div className="container">
           <div className="main-wrapper">

            </div>
        </div>
    <div className='player'>
      {player && (
        <div className="player-controls">
          <button onClick={handlePrevious}>
            <img
              src={previousIcon}
              width="24px"
              length="24px"
              />
            </button>
            <button  onClick={isPaused ? handlePlay : handlePause}>
            <img
              src={isPaused ? playIcon : pauseIcon}
              width="30px"
              length="30px"
              />
          </button>
          <button onClick={handleNext}>
          <img
              src={nextIcon}
              width="24px"
              length="24px"
              />
          </button>
        </div>
      )}
      </div>
      </div>
        </div>
    <Map
    handleClick={addTag}
    position={position}
    tagList={tagList}/>
    </>
  )}
    </>
  )
}

export default App
