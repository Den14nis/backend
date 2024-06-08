const { verifyToken } = require("../middleware/auth");

const {
	createToken,
	search,
	recommendations,
} = require("../controller/SpotifyController");

const router = require("express").Router();

router.get("/search", verifyToken, search);

router.get("/recommendations", verifyToken, recommendations);

router.post("/token", verifyToken, createToken);

module.exports = router;
