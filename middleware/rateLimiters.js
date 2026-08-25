const rateLimit = require('express-rate-limit');

// Applied only to the login route: rate limit and validate before
// anything else touches the request.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    const err = new Error('Too many login attempts. Please try again later.');
    err.status = 429;
    next(err);
  },
});

module.exports = { loginLimiter };
