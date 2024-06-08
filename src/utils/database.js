const mongoose = require("mongoose");
const db = mongoose.connection;

const { dbUrl } = require("../../config/config");

exports.connect = () => {
	mongoose.connect(dbUrl, { useNewUrlParser: true });
};

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
	console.log("connected to the database");
});
