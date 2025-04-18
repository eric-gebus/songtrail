const Tags = require('./models.js')
var access_token

async function getTags (req, res) {
  try {
    const tags = await Tags.find();
    res.status(200).json(tags);

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

async function addTag (req, res) {
  try {
    const newTag = await Tags.create(req.body);
    res.status(201).json(newTag);
  } catch (err) {
    console.log(err);
    res.status(500).json(err)
  }
}

async function getToken (req, res) {
  try {
    const { CLIENT_ID, CLIENT_SECRET } = process.env;
    console.log(CLIENT_ID, CLIENT_SECRET)
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    })
    const tokenObject = await response.json()
    res.status(200).json(tokenObject)

  } catch (err) {
    console.log(err);
      res.status(500).json(err)
  }
}

const generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

async function spotifyLogin(req, res) {
  const scope = "streaming \
  user-read-email \
  user-read-private"

  const state = generateRandomString(16);

  const { CLIENT_ID } = process.env;

  const auth_query_parameters = new URLSearchParams({
  response_type: "code",
  client_id: CLIENT_ID,
  scope: scope,
  redirect_uri: "http://127.0.0.1:3000/auth/callback",
  state: state
  })

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
}


async function spotifyAuth(req, res) {

  const code = req.query.code;
  const { CLIENT_ID, CLIENT_SECRET } = process.env;

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code: code,
      redirect_uri: "http://127.0.0.1:3000/auth/callback",
      grant_type: 'authorization_code'
    })
  });

  const tokenData = await response.json();
  access_token = tokenData.access_token;
  res.json(access_token);
}

async function returnToken(req, res) {
  res.json(
    {
      access_token: access_token
    }
  )
}



module.exports = {getTags, addTag, getToken, spotifyLogin, spotifyAuth, returnToken}