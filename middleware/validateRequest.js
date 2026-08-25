const { validationResult } = require('express-validator');

// Runs after an express-validator chain. If any field failed validation,
// short-circuits with a 400 and never lets the request reach the
// controller/service/database.
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error(errors.array()[0].msg);
    err.status = 400;
    return next(err);
  }

  next();
};

module.exports = validateRequest;
