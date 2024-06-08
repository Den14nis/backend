const User = require("../models/user");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { secretKey } = require("../../config/config");

const register = async (req, res) => {
	const userExists = await User.findOne({ email: req.body.email });
	if (userExists)
		return res.status(409).json({
			status: 409,
			message: "A user with that email already exists",
		});

	const { password, confirmationPassword } = req.body;
	if (password !== confirmationPassword) {
		return res.status(400).json({
			status: 400,
			message: "Password mismatched",
		});
	}

	const salt = await bcrypt.genSalt();
	const hashedPassword = bcrypt.hashSync(password, salt);
	const userCreated = await User.create({
		username: req.body.username,
		email: req.body.email,
		password: hashedPassword,
		likedGenres: req.body.likedGenres,
	});

	return res.status(201).json(userCreated.toResource());
};

const login = async (req, res, next) => {
	const userExists = await User.findOne({ email: req.body.email });
	if (!userExists)
		return res.status(404).json({
			status: 404,
			message: "A user with that email does not exists",
		});

	const isEquals = bcrypt.compareSync(req.body.password, userExists.password);
	if (isEquals) {
		const body = { _id: userExists._id, email: userExists.email };
		const token = jwt.sign({ user: body }, secretKey, { expiresIn: "1h" });
		return res.status(200).json({
			status: 200,
			token: token,
		});
	} else {
		res.status(400).json({
			status: 400,
			message: "Email or password are incorrect",
		});
	}
};

module.exports = {
	register,
	login,
};
