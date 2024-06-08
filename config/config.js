const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  port: process.env.PORT,
  dbUrl: process.env.MONGO_DB_URL,
  secretKey: process.env.SECRET_KEY,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  spotifyTokenUrl: process.env.SPOTIFY_TOKEN_URL,
  spotifyApiBaseUrl: process.env.SPOTIFY_API_BASE_URL,
};
