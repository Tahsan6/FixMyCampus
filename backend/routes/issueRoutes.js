const express = require('express');
const router = express.Router();

const {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  toggleUpvote,
  addComment,
  updateStatus,
} = require('../controllers/issueController');

const { verifyToken, isAdmin } = require('../middleware/auth');
const { validateIssue, validateComment, validateStatus } = require('../middleware/validate');

// GET  /api/issues           — list all (public, with search & filters)
// POST /api/issues           — create new issue (auth required)
router.get('/', getAllIssues);
router.post('/', verifyToken, validateIssue, createIssue);

// GET    /api/issues/:id     — get single issue + comments (public)
// PUT    /api/issues/:id     — update issue (owner only)
// DELETE /api/issues/:id     — delete issue (owner or admin)
router.get('/:id', getIssueById);
router.put('/:id', verifyToken, validateIssue, updateIssue);
router.delete('/:id', verifyToken, deleteIssue);

// POST  /api/issues/:id/upvote  — toggle upvote (auth required)
router.post('/:id/upvote', verifyToken, toggleUpvote);

// POST  /api/issues/:id/comments  — add comment (auth required)
router.post('/:id/comments', verifyToken, validateComment, addComment);

// PATCH /api/issues/:id/status    — update status (admin only)
router.patch('/:id/status', verifyToken, isAdmin, validateStatus, updateStatus);

module.exports = router;
