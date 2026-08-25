const { login } = require('../services/authService');

// POST /api/v1/auth/login
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, admin } = await login(email, password);
    res.status(200).json({ success: true, token, admin });
  } catch (err) {
    next(err);
  }
};

module.exports = { loginAdmin };
