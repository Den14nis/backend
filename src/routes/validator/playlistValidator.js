const { check, body } = require("express-validator");

exports.createPlaylistValidation = [
	check("title").notEmpty().withMessage("title is required"),
	check("description").notEmpty().withMessage("description is required"),
	check("tags").notEmpty().withMessage("tags is required"),
	body("tags").isArray().withMessage("tags must be an array"),
	check("tracks").notEmpty().withMessage("tracks is required"),
	body("tracks").isArray().withMessage("tracks must be an array"),
	check("isPublic").notEmpty().withMessage("isPublic is required"),
	body("isPublic").isBoolean().withMessage("isPublic must be a boolean"),
];

exports.updatePlaylistValidation = [
	body("title").optional().notEmpty().withMessage("title is required"),
	body("description")
		.optional()
		.notEmpty()
		.withMessage("description is required"),
	body("tags").optional().isArray().withMessage("tags must be an array"),
	body("isPublic")
		.optional()
		.isBoolean()
		.withMessage("isPublic must be a boolean"),
];
