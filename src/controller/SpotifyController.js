const {
	fetchToken,
	getRecommendations,
	getSearch,
} = require("../services/spotify");
const User = require("../models/user");

const search = async (req, res, next) => {
	const query = req.query.q;
	const type = req.query.type;
	const limit = req.query.limit ? req.query.limit : 20;
	const market = "IT";
	const spotify_token = (await fetchToken()).data.access_token;

	getSearch(query, type, limit, market, spotify_token).then((response) => {
		return res.status(200).json({
			status: 200,
			message: response.data,
		});
	});
};

const recommendations = async (req, res, next) => {
	const retrievedUser = await User.findOne({ _id: req.user._id });
	const limit = req.query.limit ? req.query.limit : 20;
	const seed_genres = retrievedUser.likedGenres.join(", ");
	const market = "IT";
	const spotify_token = (await fetchToken()).data.access_token;

	getRecommendations(limit, seed_genres, market, spotify_token).then(
		(response) => {
			return res.status(200).json({
				status: 200,
				message: response.data,
			});
		},
	);
};

const createToken = async (req, res) => {
	fetchToken()
		.then((response) => {
			return res.status(200).json({
				status: 200,
				token: response.data.access_token,
			});
		})
		.catch((err) => {
			return res.status(500).json({
				status: 500,
				message: "Something went wrong",
			});
		});
};

module.exports = { search, recommendations, createToken };
