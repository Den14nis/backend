const mongoose = require("mongoose");

const User = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true,
	},
	email: {
		type: String,
		unique: true,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	likedPlaylists: {
		type: [
			{
				id: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: "playlist",
				},
				isCreator: {
					type: Boolean,
					required: false,
					default: false,
				},
				title: {
					type: String,
					required: true,
				},
			},
		],
		required: false,
		default: [],
	},
	likedGenres: {
		type: [String],
		required: false,
		default: [],
	},
	likedSongs: {
		type: Array,
		default: [],
	},
	likedArtists: {
		type: Array,
		default: [],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

User.methods.toResource = function toResource() {
	return {
		_id: this._id,
		username: this.username,
		email: this.email,
		likedGenres: this.likedGenres,
		likedPlaylists: this.likedPlaylists,
		likedSongs: this.likedSongs,
		likedArtists: this.likedArtists,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt,
	};
};

module.exports = mongoose.model("Users", User);
