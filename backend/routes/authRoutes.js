const express = require('express');
const router = express.Router();

const { signup, login, getMe, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validate');

// Public
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/logout', logout);

// Protected
router.get('/me', verifyToken, getMe);

module.exports = router;
