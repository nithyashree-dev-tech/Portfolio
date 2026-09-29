const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { Admin } = require('../models');
const connectDB = require('../config/db');
const { env } = require('../config/env');

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.loginRateLimitMax,
  message: { success: false, message: 'Too many login attempts' },
});

const createToken = (email, role = 'admin') => jwt.sign({ email, role }, env.jwtSecret, {
  expiresIn: env.jwtExpiresIn,
});

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: env.authCookieMaxAgeMs,
};

router.post(
  '/login',
  loginLimiter,
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, data: {} });
    }

    const { email, password } = req.body;

    try {
      const normalizedEmail = email.toLowerCase();
      let match = false;
      let role = 'admin';

      if (connectDB.isDatabaseConnected()) {
        const admin = await Admin.findOne({ email: normalizedEmail }).lean();
        match = Boolean(admin && bcrypt.compareSync(password, admin.passwordHash));
        role = admin?.role || role;
      }

      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid email or password', data: {} });
      }

      const token = createToken(normalizedEmail, role);
      res.cookie('portfolio_admin_token', token, cookieOptions);
      return res.json({ success: true, message: 'Login successful', data: { token } });
    } catch (error) {
      return next(error);
    }
  },
);

router.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Authenticated', data: { user: req.user } });
});

router.post('/logout', authMiddleware, (req, res) => {
  res.clearCookie('portfolio_admin_token', cookieOptions);
  res.json({ success: true, message: 'Logged out successfully', data: {} });
});

module.exports = router;
