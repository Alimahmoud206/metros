const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Checks admin credentials and, if valid, returns a signed JWT.
// Throws an error with .status set on any failure so the central
// error handler returns the correct status code.
const login = async (email, password) => {
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

  if (!admin) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);

  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: admin._id.toString(), role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return { token, admin: { id: admin._id, email: admin.email, role: admin.role } };
};

module.exports = { login };
