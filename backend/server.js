require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// ── Route imports ────────────────────────────
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const myRoutes = require('./routes/myRoutes');
const statsRoutes = require('./routes/statsRoutes');

// ── Connect to MongoDB ───────────────────────
connectDB();

const app = express();

// ── Global Middleware ────────────────────────
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check ─────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 FixMyCampus API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      issues: '/api/issues',
      my: '/api/my',
      stats: '/api/stats',
    },
  });
});

// ── API Routes ───────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/my', myRoutes);
app.use('/api/stats', statsRoutes);

// ── 404 Handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ── Global Error Handler ─────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred.',
  });
});

// ── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
