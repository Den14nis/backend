const mongoose = require("mongoose");

const playListSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	tags: {
		type: [
			{
				type: String,
				required: true,
			},
		],
		required: true,
		default: [],
	},
	isPublic: {
		type: Boolean,
		required: true,
	},
	tracks: [
		{
			id: {
				type: String,
				required: true,
			},
			name: {
				type: String,
				required: true,
			},
			artists: {
				type: Array,
				required: true,
			},
			external_urls: {
				type: Array,
				required: true,
			},
			image: {
				type: String,
				required: true,
			},
			explicit: {
				type: Boolean,
				required: true,
				default: false,
			},
			duration_ms: {
				type: Number,
				required: true,
			},
			default: [],
		},
	],
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	followers: {
		type: [
			{
				userId: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: "Users",
				},
				isCreator: {
					type: Boolean,
					required: false,
					default: false,
				},
				isFollow: {
					type: Boolean,
					required: false,
					default: false,
				},
			},
		],
		required: true,
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

module.exports = mongoose.model("Playlists", playListSchema);
