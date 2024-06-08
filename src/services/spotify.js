const {
	clientId,
	clientSecret,
	spotifyTokenUrl,
	spotifyApiBaseUrl,
} = require("../../config/config");

const axios = require("axios");

const fetchToken = () => {
	const params = new URLSearchParams();
	params.append("client_id", clientId);
	params.append("client_secret", clientSecret);
	params.append("grant_type", "client_credentials");

	const config = {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	};

	return axios.post(spotifyTokenUrl, params, config);
};

const getSearch = (query, type, limit, market, spotify_token) => {
	const config = {
		headers: {
			Authorization: `Bearer ${spotify_token}`,
		},
		params: {
			q: query,
			type: type,
			limit: limit,
			market: market,
		},
	};

	return axios.get(spotifyApiBaseUrl + "/search", config);
};

const getRecommendations = (limit, seed_genres, market, spotify_token) => {
	const config = {
		headers: {
			Authorization: `Bearer ${spotify_token}`,
		},
		params: {
			limit: limit,
			seed_genres: seed_genres,
			market: market,
		},
	};

	return axios.get(spotifyApiBaseUrl + "/recommendations", config);
};

module.exports = {
	fetchToken,
	getSearch,
	getRecommendations,
};
