const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const app = express();

app.use(cors());
app.use(express.json());

const database = require("./src/utils/database");
database.connect();

const { port } = require("./config/config");
const appPort = port || 3000;

const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const playlistRoutes = require("./src/routes/playlist");
const spotifyRoutes = require("./src/routes/spotify");

app.use("/api/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/spotify", spotifyRoutes);

app.listen(appPort, () => {
	console.log(`App in ascolto sulla porta ${appPort}`);
});
