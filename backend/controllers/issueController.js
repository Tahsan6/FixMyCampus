const Issue = require('../models/Issue');
const Comment = require('../models/Comment');

// ─────────────────────────────────────────────
// @route   POST /api/issues
// @desc    Create a new campus issue
// @access  Private
// ─────────────────────────────────────────────
const createIssue = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      createdBy: req.user.id,
    });

    // Populate the author info for the response
    await issue.populate('createdBy', 'name email role department');

    res.status(201).json({ message: 'Issue reported successfully.', issue });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/issues
// @desc    Get all issues with optional search & filters
//          Query params: ?search=&category=&status=&sort=&page=&limit=
// @access  Public
// ─────────────────────────────────────────────
const getAllIssues = async (req, res) => {
  try {
    const { search, category, status, sort, page = 1, limit = 10 } = req.query;

    // Build the filter object
    const filter = {};

    if (category) {
      const validCategories = ['Electrical', 'Water', 'Cleanliness', 'Furniture', 'Internet', 'Other'];
      if (validCategories.includes(category)) {
        filter.category = category;
      }
    }

    if (status) {
      const validStatuses = ['Open', 'In Progress', 'Resolved'];
      if (validStatuses.includes(status)) {
        filter.status = status;
      }
    }

    if (search && search.trim()) {
      // Case-insensitive regex search across title, description, and location
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: regex }, { description: regex }, { location: regex }];
    }

    // Sort options: newest (default), oldest, most-upvoted
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'upvotes') sortOption = { upvotes: -1 }; // Most upvotes first

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Cap at 50 per page
    const skip = (pageNum - 1) * limitNum;

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .populate('createdBy', 'name email role department')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Issue.countDocuments(filter),
    ]);

    res.status(200).json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      issues,
    });
  } catch (error) {
    console.error('Get all issues error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/issues/:id
// @desc    Get a single issue by ID with author and comments
// @access  Public
// ─────────────────────────────────────────────
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate(
      'createdBy',
      'name email role department'
    );

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    // Fetch all comments for this issue, newest first, with author info
    const comments = await Comment.find({ issueId: req.params.id })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ issue, comments });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid issue ID format.' });
    }
    console.error('Get issue by ID error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// @route   PUT /api/issues/:id
// @desc    Edit an issue (Owner only)
// @access  Private
// ─────────────────────────────────────────────
const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    // Only the creator can edit the issue
    if (issue.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access forbidden. You can only edit your own issues.' });
    }

    const { title, description, category, location } = req.body;

    // Only update fields that are sent in the request
    if (title) issue.title = title.trim();
    if (description) issue.description = description.trim();
    if (category) issue.category = category;
    if (location) issue.location = location.trim();

    await issue.save();
    await issue.populate('createdBy', 'name email role department');

    res.status(200).json({ message: 'Issue updated successfully.', issue });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid issue ID format.' });
    }
    console.error('Update issue error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// @route   DELETE /api/issues/:id
// @desc    Delete an issue (Owner or Admin)
// @access  Private
// ─────────────────────────────────────────────
const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    // Allow deletion if the user is the owner OR an admin
    const isOwner = issue.createdBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access forbidden. You can only delete your own issues.' });
    }

    await Issue.findByIdAndDelete(req.params.id);

    // Also delete all comments associated with this issue (cleanup)
    await Comment.deleteMany({ issueId: req.params.id });

    res.status(200).json({ message: 'Issue deleted successfully.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid issue ID format.' });
    }
    console.error('Delete issue error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/issues/:id/upvote
// @desc    Toggle upvote on an issue (add if not voted, remove if already voted)
// @access  Private
// ─────────────────────────────────────────────
const toggleUpvote = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const userId = req.user.id;
    const hasUpvoted = issue.upvotes.some((id) => id.toString() === userId);

    if (hasUpvoted) {
      // Remove upvote (pull)
      await Issue.findByIdAndUpdate(req.params.id, { $pull: { upvotes: userId } });
      const updated = await Issue.findById(req.params.id);
      return res.status(200).json({
        message: 'Upvote removed.',
        upvoteCount: updated.upvotes.length,
        upvoted: false,
      });
    } else {
      // Add upvote (addToSet prevents duplicates at DB level too)
      await Issue.findByIdAndUpdate(req.params.id, { $addToSet: { upvotes: userId } });
      const updated = await Issue.findById(req.params.id);
      return res.status(200).json({
        message: 'Upvote added.',
        upvoteCount: updated.upvotes.length,
        upvoted: true,
      });
    }
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid issue ID format.' });
    }
    console.error('Toggle upvote error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/issues/:id/comments
// @desc    Add a comment to an issue
// @access  Private
// ─────────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    // Verify the issue exists first
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const comment = await Comment.create({
      issueId: req.params.id,
      userId: req.user.id,
      text: req.body.text.trim(),
    });

    // Return the comment with author info populated
    await comment.populate('userId', 'name email role');

    res.status(201).json({ message: 'Comment added successfully.', comment });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid issue ID format.' });
    }
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// @route   PATCH /api/issues/:id/status
// @desc    Update issue status (Admin only)
//          Body: { status: "Open" | "In Progress" | "Resolved" }
// @access  Private + isAdmin
// ─────────────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role department');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    res.status(200).json({ message: `Issue status updated to "${status}".`, issue });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid issue ID format.' });
    }
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/my/issues
// @desc    Get all issues created by the logged-in user
// @access  Private
// ─────────────────────────────────────────────
const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ createdBy: req.user.id })
      .populate('createdBy', 'name email role department')
      .sort({ createdAt: -1 });

    res.status(200).json({ total: issues.length, issues });
  } catch (error) {
    console.error('Get my issues error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  toggleUpvote,
  addComment,
  updateStatus,
  getMyIssues,
};
