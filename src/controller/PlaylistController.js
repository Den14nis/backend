const { ObjectId } = require("mongodb");
const { isValidObjectId } = require("mongoose");
const User = require("../models/user");
const Playlist = require("../models/playlist");
const userService = require("../services/user");

const getAllPublicPlaylists = async (req, res) => {
	const pageSize = parseInt(req.query.size) || 20;
	const page = parseInt(req.query.page) || 1;
	const sort = req.query.sort ? req.query.sort : 1;
	const retrievedPublicPlaylists = await Playlist.find()
		.where("isPublic", true)
		.skip((page - 1) * pageSize)
		.limit(pageSize)
		.sort({ title: sort });

	return res.status(200).json({
		status: 200,
		pageSize: pageSize,
		sort: sort == 1 ? "title asc" : "title desc",
		playlists: retrievedPublicPlaylists,
	});
};

const getAllUserPublicPlaylists = async (req, res) => {
	const pageSize = req.query.size ? req.query.size : 20;
	const sort = req.query.sort ? req.query.sort : 1;
	const retrievedPublicPlaylists = await Playlist.find({
		creator: req.params.userId,
		isPublic: true,
	})
		.limit(pageSize)
		.sort({ title: sort });

	return res.status(200).json({
		status: 200,
		pageSize: pageSize,
		sort: sort == 1 ? "title asc" : "title desc",
		playlists: retrievedPublicPlaylists,
	});
};

const getLikedPlaylists = async (req, res) => {
	const pageSize = req.query.size ? req.query.size : 20;
	const sort = req.query.sort ? req.query.sort : 1;
	const retrievedUser = await userService.getUserById(req.user._id);
	const likedPlaylists = retrievedUser.likedPlaylists.map(
		(playlist) => playlist.id,
	);
	const retrievedLikedPlaylists = await Playlist.find({
		_id: { $in: likedPlaylists },
	})
		.limit(pageSize)
		.sort({ title: sort });

	return res.status(200).json({
		status: 200,
		pageSize: pageSize,
		sort: sort == 1 ? "title asc" : "title desc",
		playlists: retrievedLikedPlaylists,
	});
};

const searchPublicPlaylists = async (req, res) => {
	const pageSize = req.query.size ? req.query.size : 20;
	const sort = req.query.sort ? req.query.sort : 1;
	const title = req.query.title ? req.query.title : "";
	const retrievedPublicPlaylists = await Playlist.find()
		.where("title", new RegExp(title, "i"))
		.limit(pageSize)
		.sort({ title: sort });

	return res.status(200).json({
		status: 200,
		pageSize: pageSize,
		sort: sort == 1 ? "title asc" : "title desc",
		playlists: retrievedPublicPlaylists,
	});
};

const search = async (req, res) => {
	const pageSize = req.query.size ? req.query.size : 20;
	const sort = req.query.sort ? req.query.sort : 1;
	const title = req.query.title ? req.query.title : "";
	const retrievedPlaylist = await Playlist.find()
		.where("title", new RegExp(title, "i"))
		.where("isPublic", true)
		.limit(pageSize)
		.sort({ title: sort });

	return res.status(200).json({
		status: 200,
		pageSize: pageSize,
		sort: sort == 1 ? "title asc" : "title desc",
		playlists: retrievedPlaylist,
	});
};

const getPlaylistById = async (req, res) => {
	const playlistId = req.params.playlistId;
	if (!isValidObjectId(playlistId)) {
		return res.status(400).json({
			status: 400,
			message: `Param ${playlistId} is not valid`,
		});
	}

	const retrievedPlaylist = await Playlist.findOne({ _id: playlistId });
	if (!retrievedPlaylist) {
		return res.status(404).json({
			status: 404,
			message: `Playlist with id ${playlistId} not found`,
		});
	}

	if (
		!retrievedPlaylist.isPublic &&
		retrievedPlaylist.creator != req.user._id
	) {
		return res.status(401).json({
			status: 401,
			message: "You need to be the creator to view this playlist",
		});
	}

	return res.status(200).json({
		status: 200,
		playlist: retrievedPlaylist,
	});
};

const createPlaylist = async (req, res) => {
	const { title, description, tags, tracks, isPublic } = req.body;

	const retrievedPlaylist = await Playlist.findOne({ title: title });
	if (retrievedPlaylist) {
		return res.status(409).json({
			status: 409,
			message: `Playlist with title ${title} already exists`,
		});
	}

	const creator = req.user._id;
	const followers = { userId: req.user._id, isCreator: true, isFollow: true };

	const playlistToSave = new Playlist({
		title: title,
		description: description,
		tracks: tracks,
		tags: tags,
		isPublic: isPublic,
		creator: creator,
		followers: followers,
	});

	const playlistSaved = await playlistToSave.save();

	const retrievedUser = await User.findById(creator);
	retrievedUser.likedPlaylists.push({
		id: playlistSaved.id,
		creator: true,
		title: title,
	});

	retrievedUser.save();

	return res.status(201).json({
		status: 201,
		playlist: playlistSaved,
	});
};

const likePlaylist = async (req, res) => {
	const playlistId = req.params.playlistId;
	if (!isValidObjectId(playlistId)) {
		return res.status(400).json({
			status: 400,
			message: `Param ${playlistId} is not valid`,
		});
	}

	const retrievedPlaylist = await Playlist.findOne({ _id: playlistId });
	if (!retrievedPlaylist) {
		return res.status(404).json({
			status: 404,
			message: `Playlist with id ${playlistId} not found`,
		});
	}

	const retrievedUser = await User.findById(req.user._id);
	const likedPlaylists = retrievedUser.likedPlaylists.map(
		(playlist) => playlist.id,
	);

	const convertedPlaylistId = new ObjectId(playlistId);
	if (likedPlaylists.some((id) => id.equals(convertedPlaylistId))) {
		retrievedUser.likedPlaylists = retrievedUser.likedPlaylists.filter(
			(playlist) => playlist.id != playlistId,
		);
	} else {
		retrievedUser.likedPlaylists.push({
			id: playlistId,
			creator: retrievedPlaylist.creator == req.user._id,
			title: retrievedPlaylist.title,
		});
	}
	retrievedUser.save();

	const followers = retrievedPlaylist.followers.map(
		(follower) => follower.userId,
	);
	const convertedFollowerId = new ObjectId(req.user._id);
	if (followers.some((id) => id.equals(convertedFollowerId))) {
		retrievedPlaylist.followers = retrievedPlaylist.followers.filter(
			(follower) => follower.userId != req.user._id,
		);
	} else {
		retrievedPlaylist.followers.push({
			userId: req.user._id,
			isFollow: true,
			isCreator: false,
		});
	}

	retrievedPlaylist.save();

	return res.status(200).json({
		status: 200,
		message: `Playlist with id ${playlistId} liked`,
	});
};

const followPlaylist = async (req, res) => {
	const playlistId = req.params.playlistId;
	if (!isValidObjectId(playlistId)) {
		return res.status(400).json({
			status: 400,
			message: `Param ${playlistId} is not valid`,
		});
	}

	const retrievedPlaylist = await Playlist.findOne({ _id: playlistId });
	if (!retrievedPlaylist) {
		return res.status(404).json({
			status: 404,
			message: `Playlist with id ${playlistId} not found`,
		});
	}

	if (retrievedPlaylist.creator == req.user._id) {
		return res.status(400).json({
			status: 400,
			message: `Cannot defollow a playlist you created`,
		});
	}

	const foundIndex = retrievedPlaylist.followers.findIndex(
		(follower) => follower.userId == req.user_id,
	);

	if (!foundIndex) {
		retrievedPlaylist.followers.push({ userId: req.user._id, isFollow: true });
		retrievedPlaylist.save();
		return res.status(200).json({
			status: 200,
			message: "You are now following this playlist",
		});
	} else {
		retrievedPlaylist.followers.splice(foundIndex, 1);
		retrievedPlaylist.save();
		return res.status(200).json({
			status: 200,
			message: "You are no longer following this playlist",
		});
	}
};

const updatePlaylist = async (req, res) => {
	const playlistId = req.params.playlistId;
	if (!isValidObjectId(playlistId)) {
		return res.status(400).json({
			status: 400,
			message: `Param ${playlistId} is not valid`,
		});
	}

	const playlistToUpdate = await Playlist.findOne({ _id: playlistId });
	if (!playlistToUpdate) {
		return res.status(404).json({
			status: 404,
			message: `Playlist with id:${playlistId} not found`,
		});
	}

	if (playlistToUpdate.creator != req.user._id) {
		return res.status(401).json({
			status: 401,
			message: "You need to be the creator to edit this playlist",
		});
	}

	const isPublic = req.body.isPublic;
	if (
		isPublic != playlistToUpdate.isPublic &&
		playlistToUpdate.followers.length > 1
	) {
		return res.status(400).json({
			status: 400,
			error: "Cannot edit playlist visibility because there are followers",
		});
	}

	playlistToUpdate.title = req.body.title
		? req.body.title
		: playlistToUpdate.title;
	playlistToUpdate.description = req.body.description
		? req.body.description
		: playlistToUpdate.description;
	playlistToUpdate.tags = req.body.tags ? req.body.tags : playlistToUpdate.tags;
	playlistToUpdate.isPublic =
		isPublic != undefined ? isPublic : playlistToUpdate.isPublic;

	const updatedPlaylist = await playlistToUpdate.save();

	return res.status(200).json({
		status: 200,
		playlist: updatedPlaylist,
	});
};

const patchPlaylist = async (req, res) => {
	const playlistId = req.params.playlistId;
	if (!isValidObjectId(playlistId)) {
		return res.status(400).json({
			status: 400,
			message: `Param ${playlistId} is not valid`,
		});
	}

	const playlistToUpdate = await Playlist.findOne({ _id: playlistId });
	if (!playlistToUpdate) {
		return res.status(404).json({
			status: 404,
			message: `Playlist with id:${playlistId} not found`,
		});
	}

	if (playlistToUpdate.creator != req.user._id) {
		return res.status(401).json({
			status: 401,
			message: "You need to be the creator to edit this playlist",
		});
	}

	playlistToUpdate.tracks = req.body.tracks
		? req.body.tracks
		: playlistToUpdate.tracks;

	const updatedPlaylist = await playlistToUpdate.save();

	return res.status(200).json({
		status: 200,
		playlist: updatedPlaylist,
	});
};

const deletePlaylist = async (req, res) => {
	const playlistId = req.params.playlistId;
	if (!isValidObjectId(playlistId)) {
		return res.status(400).json({
			status: 400,
			message: `Param ${playlistId} is not valid`,
		});
	}

	console.log(playlistId);
	const playlistToDelete = await Playlist.findOne({ _id: playlistId });
	if (!playlistToDelete) {
		return res.status(404).json({
			status: 404,
			message: `Playlist with id ${playlistId} not found`,
		});
	}

	if (!playlistToDelete.creator == req.user._id) {
		return res.status(401).json({
			status: 401,
			message: `Cannot delete a playlist you don't own`,
		});
	}

	const followers = await User.find({
		likedPlaylists: { $elemMatch: { id: playlistToDelete.id } },
	});

	followers.forEach(async (follower) => {
		follower.likedPlaylists = follower.likedPlaylists.filter(
			(p) => p.id.toString() !== playlistId,
		);
		await follower.save();
	});

	await playlistToDelete.deleteOne();

	return res.sendStatus(204);
};

module.exports = {
	getAllPublicPlaylists,
	getAllUserPublicPlaylists,
	getLikedPlaylists,
	searchPublicPlaylists,
	search,
	getPlaylistById,
	createPlaylist,
	likePlaylist,
	followPlaylist,
	updatePlaylist,
	patchPlaylist,
	deletePlaylist,
};
