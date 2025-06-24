const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');


const {
  register,
  login,
  forgotPassword,
  resetPassword
} = require('../controllers/auth');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// API endpoints
router.post('/register', authLimiter, register);
router.post('/login', authController.login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Test endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Auth API is working',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      forgotPassword: 'POST /api/auth/forgot-password',
      resetPassword: 'POST /api/auth/reset-password/:token'
    }
  });
});

module.exports = router;