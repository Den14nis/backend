const bcrypt = require("bcrypt");

const User = require("../models/user");
const Playlist = require("../models/playlist");
const userService = require("../services/user");

const getMe = async (req, res) => {
	const retrievedUser = await userService.getUserById(req.user._id);
	return res.status(200).json({
		status: 200,
		user: retrievedUser.toResource(),
	});
};

const search = async (req, res) => {
	const { username } = req.query;
	const users = await User.find({
		username: { $regex: new RegExp(username, "i") },
	});
	return res.status(200).json({
		status: 200,
		users: users.map((user) => user.toResource()),
	});
};

const getLikedGenres = async (req, res) => {
	const retrievedUser = await User.findById(req.user._id);
	return res.status(200).json({
		status: 200,
		likedGenres: retrievedUser.likedGenres,
	});
};

const getLikedSongs = async (req, res) => {
	const retrievedUser = await userService.getUserById(req.user._id);
	return res.status(200).json({
		status: 200,
		likedSongs: retrievedUser.likedSongs,
	});
};

const getLikedArtists = async (req, res) => {
	const retrievedUser = await userService.getUserById(req.user._id);
	return res.status(200).json({
		status: 200,
		likedArtists: retrievedUser.likedArtists,
	});
};

const getUserById = async (req, res) => {
	const retrievedUser = await userService.getUserById(req.params.userId);
	return res.status(200).json({
		status: 200,
		user: retrievedUser.toResource(),
	});
};

const updateUser = async (req, res) => {
	const userToUpdate = await User.findOne({ _id: req.user._id });
	const updatedUsername = req.body.username
		? req.body.username
		: userToUpdate.username;
	const updatedEmail = req.body.email ? req.body.email : userToUpdate.email;

	userToUpdate.username = updatedUsername;
	userToUpdate.email = updatedEmail;

	const updatedUser = await userToUpdate.save();

	return res.status(200).json({
		status: 200,
		user: updatedUser.toResource(),
	});
};

const updatePassword = async (req, res) => {
	const userToUpdate = await User.findOne({ _id: req.user._id });
	const oldPassword = req.body.oldPassword;
	const newPassword = req.body.newPassword;
	const confirmationPassword = req.body.confirmationPassword;

	if (oldPassword && newPassword && confirmationPassword) {
		const isPasswordValid = bcrypt.compareSync(
			oldPassword,
			userToUpdate.password,
		);
		if (!isPasswordValid) {
			return res.status(400).json({
				status: 400,
				message: "Invalid password",
			});
		}
		if (oldPassword === newPassword) {
			return res.status(400).json({
				status: 400,
				message: "New password must be different from the old password",
			});
		}
		if (newPassword !== confirmationPassword) {
			return res.status(400).json({
				status: 422,
				message: "Password mismatched",
			});
		}
		const salt = await bcrypt.genSalt();
		const hashedPassword = bcrypt.hashSync(newPassword, salt);
		userToUpdate.password = hashedPassword;

		const updatedUser = await userToUpdate.save();
		return res.status(200).json({
			status: 200,
			user: updatedUser.toResource(),
		});
	} else {
		return res.status(400).json({
			status: 400,
			message: "Missing required fields",
		});
	}
};

const updateLikedArtists = async (req, res) => {
	const { id, name, external_urls, image } = req.body;
	const retrievedUser = await userService.getUserById(req.user._id);
	const likedArtistIndex = retrievedUser.likedArtists.findIndex(
		(artist) => artist.id === id,
	);

	if (likedArtistIndex !== -1) {
		retrievedUser.likedArtists.splice(likedArtistIndex, 1);
		await retrievedUser.save();
		return res.status(200).json({
			status: 200,
			message: "Artist removed from liked songs",
		});
	} else {
		retrievedUser.likedArtists.push({
			id,
			name,
			external_urls,
			image,
		});
		await retrievedUser.save();
		return res.status(200).json({
			status: 200,
			message: "Artist liked",
		});
	}
};

const updateLikedGenres = async (req, res) => {
	const { likedGenres } = req.body;

	const uniqueGenres = new Set(likedGenres);
	if (uniqueGenres.size !== likedGenres.length) {
		return res.status(400).json({
			status: 400,
			message: "Duplicated genre",
		});
	}

	const retrievedUser = await User.findById(req.user._id);
	retrievedUser.likedGenres = likedGenres;

	const updatedUser = await retrievedUser.save();
	return res.status(200).json({
		status: 200,
		element: updatedUser,
	});
};

const updateLikedSongs = async (req, res) => {
	const { id, name, artists, external_urls, image, explicit, duration_ms } =
		req.body;
	const retrievedUser = await userService.getUserById(req.user._id);
	const likedSongIndex = retrievedUser.likedSongs.findIndex(
		(song) => song.id === id,
	);

	if (likedSongIndex !== -1) {
		retrievedUser.likedSongs.splice(likedSongIndex, 1);
		await retrievedUser.save();
		return res.status(200).json({
			status: 200,
			message: "Song removed from liked songs",
		});
	} else {
		retrievedUser.likedSongs.push({
			id,
			name,
			artists,
			external_urls,
			image,
			explicit,
			duration_ms,
		});
		await retrievedUser.save();
		return res.status(200).json({
			status: 200,
			message: "Song liked",
		});
	}
};

const deleteUser = async (req, res) => {
	const retrievedUser = await User.findById(req.user._id);
	retrievedUser.likedPlaylists.forEach(async (likedPlaylist) => {
		if (likedPlaylist.isCreator) {
			const followers = await User.find({
				likedPlaylists: {
					$elemMatch: {
						id: likedPlaylist.id,
					},
				},
			});
			followers.forEach(async (follower) => {
				follower.likedPlaylists.filter(
					(p) => p.id.toString() !== likedPlaylist.id.toString(),
				);
				await follower.save();
			});

			await Playlist.deleteOne(likedPlaylist);
		}
	});

	await User.deleteOne(retrievedUser);

	return res.sendStatus(204);
};

module.exports = {
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
};
