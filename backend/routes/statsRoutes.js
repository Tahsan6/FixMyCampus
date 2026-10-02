const express = require('express');
const router = express.Router();

const { getStats } = require('../controllers/statsController');

// GET /api/stats  — public dashboard analytics
router.get('/', getStats);

module.exports = router;
