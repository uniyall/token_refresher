const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const request = require('request');

// Load environment variables from the .env file
dotenv.config();

const app = express();
const port = 3005;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Load client credentials from environment variables
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const refresh_token = process.env.REFRESH_TOKEN

app.get('/refresh_token', function (req, res) {

  if (!refresh_token) {
    return res.status(400).send({ error: 'Refresh token is required' });
  }

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (error) {
      return res.status(500).send({ error: 'Something went wrong with the request' });
    }

    if (response.statusCode === 200) {
      const access_token = body.access_token;
      const new_refresh_token = body.refresh_token || refresh_token;

      res.send({
        access_token: access_token,
        refresh_token: new_refresh_token,
      });
    } else {
      res.status(response.statusCode).send({ error: body.error || 'Failed to refresh token' });
    }
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
