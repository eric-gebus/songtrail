import React from "react";

function Login() {
  return (
      <div className="App">
          <header className="App-header">
              <a className="btn-spotify" href="/auth/login" >
              <button>
                  Login with Spotify
              </button>
              </a>
          </header>
      </div>
  );
}

export default Login