// Central error-handling middleware.
// Every thrown/next(err) error in the app ends up here.
// Reads err.status (default 500) and err.message (default generic message)
// and always responds with the same JSON shape.
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Internal server error';

  if (statusCode >= 500) {
    // Only log unexpected server errors, not routine 4xx validation/auth failures.
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
