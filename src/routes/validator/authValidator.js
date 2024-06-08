const { check, body } = require('express-validator')

exports.registerValidation = [
    check('username').notEmpty().withMessage("username is required"),
    check('email').notEmpty().withMessage("email is required"),
    body('email').isEmail().withMessage("email is not valid"),
    check('password').notEmpty().withMessage("password is required"),
    body('password').isLength({min: 8}).withMessage("password min length is 8 characters"),
    check('confirmationPassword').notEmpty().withMessage("confirmationPassword is required"),
    body('confirmationPassword').isLength({min: 8}).withMessage("confirmationPassword min length is 8 characters"),
]

exports.loginValidation = [
    check('email').notEmpty().withMessage("email is required"),
    check('password').notEmpty().withMessage("password is required"),
]