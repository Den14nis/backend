const router = require("express").Router();

const { verifyToken } = require("../middleware/auth");
const {
	createPlaylistValidation,
	updatePlaylistValidation,
} = require("./validator/playlistValidator");
const { validationResult } = require("express-validator");
const {
	getAllPublicPlaylists,
	getAllUserPublicPlaylists,
	getLikedPlaylists,
	searchPublicPlaylists,
	search,
	getPlaylistById,
	createPlaylist,
	likePlaylist,
	updatePlaylist,
	patchPlaylist,
	deletePlaylist,
	followPlaylist,
} = require("../controller/playlistController");

router.get("/public", verifyToken, getAllPublicPlaylists);

router.get("/public/user/:userId", verifyToken, getAllUserPublicPlaylists);

router.get("/liked", verifyToken, getLikedPlaylists);

router.get("/public/search", verifyToken, searchPublicPlaylists);

router.get("/search", verifyToken, search);

router.get("/:playlistId", verifyToken, getPlaylistById);

router.post(
	"/",
	verifyToken,
	createPlaylistValidation,
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		return next();
	},
	createPlaylist,
);

router.post("/:playlistId/like", verifyToken, likePlaylist);

router.post("/:playlistId/follow", verifyToken, followPlaylist);

router.put(
	"/:playlistId",
	verifyToken,
	updatePlaylistValidation,
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		return next();
	},
	updatePlaylist,
);

router.patch("/:playlistId", verifyToken, patchPlaylist);

router.delete("/:playlistId", verifyToken, deletePlaylist);

module.exports = router;
