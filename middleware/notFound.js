// Catches any request that didn't match a route above it and turns it
// into a normal error so it flows through the central errorHandler.
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

module.exports = notFound;
