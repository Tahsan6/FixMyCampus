const express = require('express');
const router = express.Router();

const { signup, login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validate');

// POST /api/auth/signup
router.post('/signup', validateSignup, signup);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// GET /api/auth/me  — returns current logged-in user's profile
router.get('/me', verifyToken, getMe);

module.exports = router;
