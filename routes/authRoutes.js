const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiters');
const { loginValidator } = require('../validators/authValidators');
const validateRequest = require('../middleware/validateRequest');

// POST /api/v1/auth/login
// Order matters: rate limit -> validate shape -> controller/service.
router.post('/login', loginLimiter, loginValidator, validateRequest, loginAdmin);

module.exports = router;
