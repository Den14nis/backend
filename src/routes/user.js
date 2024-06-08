const router = require("express").Router();
const { verifyToken } = require("../middleware/auth");

const {
	getMe,
	search,
	getLikedGenres,
	getLikedSongs,
	getLikedArtists,
	getUserById,
	updateUser,
	updatePassword,
	updateLikedArtists,
	updateLikedGenres,
	updateLikedSongs,
	deleteUser,
} = require("../controller/UserController");

router.get("/me", verifyToken, getMe);

router.get("/search", verifyToken, search);

router.get("/likedGenres", verifyToken, getLikedGenres);

router.get("/likedSongs", verifyToken, getLikedSongs);

router.get("/likedArtists", verifyToken, getLikedArtists);

router.get("/:userId", verifyToken, getUserById);

router.put("/update", verifyToken, updateUser);

router.post("/update-password", verifyToken, updatePassword);

router.put("/likedArtists", verifyToken, updateLikedArtists);

router.put("/likedGenres", verifyToken, updateLikedGenres);

router.put("/likedSongs", verifyToken, updateLikedSongs);

router.delete("/delete", verifyToken, deleteUser);

module.exports = router;
