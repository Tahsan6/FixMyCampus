const express = require('express');
const router = express.Router();

const { getMyIssues } = require('../controllers/issueController');
const { verifyToken } = require('../middleware/auth');

// GET /api/my/issues  — get logged-in user's submitted issues
router.get('/issues', verifyToken, getMyIssues);

module.exports = router;
