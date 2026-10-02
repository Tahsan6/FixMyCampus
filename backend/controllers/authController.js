const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Helper — signs a JWT token for a given user
 */
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password, role, studentId, department } = req.body;

    // Check if email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user — only allow 'student' via public signup (admin must be set in DB)
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role === 'admin' ? 'student' : (role || 'student'), // Prevent admin self-registration
      studentId,
      department,
    });

    const token = signToken(newUser);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        studentId: newUser.studentId,
        department: newUser.department,
      },
    });
  } catch (error) {
    // Mongoose duplicate key error (race condition safety)
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Authenticate user and return JWT
// @access  Public
// ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Generic message to prevent user enumeration
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get currently logged-in user's profile
// @access  Private (verifyToken)
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user.id is set by verifyToken middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { signup, login, getMe };
