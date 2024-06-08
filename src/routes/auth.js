const authController = require("../controller/auth");
const router = require("express").Router();

const { validationResult } = require("express-validator");
const {
	registerValidation,
	loginValidation,
} = require("./validator/authValidator");

router.post(
	"/register",
	registerValidation,
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		return next();
	},
	authController.register,
);

router.post(
	"/login",
	loginValidation,
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		return next();
	},
	authController.login,
);

module.exports = router;
