const User = require("../models/user");

async function getUserById(id) {
	return await User.findById(id);
}

module.exports = {
	getUserById,
};
