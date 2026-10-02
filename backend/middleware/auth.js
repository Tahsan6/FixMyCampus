const jwt = require('jsonwebtoken');

/**
 * verifyToken — Protects routes that require a logged-in user.
 * Expects: Authorization: Bearer <token>
 * On success: attaches decoded payload { id, role } to req.user
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

/**
 * isAdmin — Must be used AFTER verifyToken.
 * Blocks non-admin users with 403 Forbidden.
 */
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access forbidden. Admin role required.' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
