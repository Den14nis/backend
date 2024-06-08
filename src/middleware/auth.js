const jwt = require("jsonwebtoken");
const User = require("../models/user");

const { secretKey } = require("../../config/config");

exports.verifyToken = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(400).json({
			status: 400,
			message: "Authorizzation token is missing",
		});
	}
	if (authHeader.startsWith("Bearer ")) {
		const token = authHeader.substring(7, authHeader.length);

		jwt.verify(token, secretKey, (err, decoded) => {
			if (err) {
				return res.status(401).json({
					status: 401,
					message: "Authorization token is not valid",
				});
			}

			User.findOne({ _id: decoded.user._id })
				.then((retrievedUser) => {
					if (!retrievedUser) {
						return res.status(404).json({
							status: 404,
							message: "Logged user not found",
						});
					}
					const user = {
						_id: decoded.user._id,
					};

					req.user = user;
					return next();
				})
				.catch(() => {
					return res.status(500).json({
						status: 500,
						message: "internal server error",
					});
				});
		});
	} else {
		return res.status(401).json({
			status: 401,
			message: "Authorization token is missing bearer token",
		});
	}
};
