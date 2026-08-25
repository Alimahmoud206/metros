const jwt = require('jsonwebtoken');

// Guards admin-only actions (e.g. posting an announcement).
// Public reads never use this middleware.
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or malformed authorization header');
    err.status = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    const err = new Error('Missing token');
    err.status = 401;
    return next(err);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      const err = new Error('Admin access required');
      err.status = 403;
      return next(err);
    }

    req.admin = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    const authErr = new Error('Invalid or expired token');
    authErr.status = 401;
    next(authErr);
  }
};

module.exports = requireAdmin;
