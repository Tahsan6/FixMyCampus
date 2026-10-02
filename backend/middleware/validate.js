/**
 * validate.js — Lightweight request body validation middleware.
 * Returns clean 400 responses for missing or invalid required fields.
 */

/**
 * validateSignup — Checks required fields for POST /api/auth/signup
 */
const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || !name.trim()) errors.push('Name is required.');
  if (!email || !email.trim()) errors.push('Email is required.');
  if (!password) errors.push('Password is required.');
  if (password && password.length < 6) errors.push('Password must be at least 6 characters.');

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed.', errors });
  }
  next();
};

/**
 * validateLogin — Checks required fields for POST /api/auth/login
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) errors.push('Email is required.');
  if (!password) errors.push('Password is required.');

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed.', errors });
  }
  next();
};

/**
 * validateIssue — Checks required fields for POST /api/issues and PUT /api/issues/:id
 */
const VALID_CATEGORIES = ['Electrical', 'Water', 'Cleanliness', 'Furniture', 'Internet', 'Other'];

const validateIssue = (req, res, next) => {
  const { title, description, category, location } = req.body;
  const errors = [];

  if (!title || !title.trim()) errors.push('Title is required.');
  if (!description || !description.trim()) errors.push('Description is required.');
  if (!category || !category.trim()) {
    errors.push('Category is required.');
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  }
  if (!location || !location.trim()) errors.push('Location is required.');

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed.', errors });
  }
  next();
};

/**
 * validateComment — Checks required fields for POST /api/issues/:id/comments
 */
const validateComment = (req, res, next) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Validation failed.', errors: ['Comment text is required.'] });
  }
  next();
};

/**
 * validateStatus — Checks valid status for PATCH /api/issues/:id/status
 */
const VALID_STATUSES = ['Open', 'In Progress', 'Resolved'];

const validateStatus = (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Validation failed.', errors: ['Status is required.'] });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: [`Status must be one of: ${VALID_STATUSES.join(', ')}.`],
    });
  }
  next();
};

module.exports = { validateSignup, validateLogin, validateIssue, validateComment, validateStatus };
