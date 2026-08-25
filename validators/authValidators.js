const { body } = require('express-validator');

// Validates email + password are present and well-formed BEFORE any
// database or auth logic runs.
const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Email must be a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isString()
    .withMessage('Password must be a string'),
];

module.exports = { loginValidator };
