const Issue = require('../models/Issue');

// ─────────────────────────────────────────────
// @route   GET /api/stats
// @desc    Return dashboard statistics:
//          - Total/Open/In Progress/Resolved counts
//          - Category breakdown
//          - Top 5 most upvoted (urgent) issues
// @access  Public
// ─────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    // Run all aggregations in parallel for efficiency
    const [statusCounts, categoryCounts, topUpvoted] = await Promise.all([
      // 1. Count issues grouped by status
      Issue.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // 2. Count issues grouped by category
      Issue.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // 3. Top 5 most upvoted open issues (most urgent)
      Issue.aggregate([
        { $match: { status: { $ne: 'Resolved' } } }, // Exclude resolved issues
        {
          $addFields: {
            upvoteCount: { $size: '$upvotes' },
          },
        },
        { $sort: { upvoteCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy',
          },
        },
        { $unwind: '$createdBy' },
        {
          $project: {
            title: 1,
            category: 1,
            status: 1,
            location: 1,
            upvoteCount: 1,
            createdAt: 1,
            'createdBy.name': 1,
            'createdBy.email': 1,
          },
        },
      ]),
    ]);

    // Map status counts into a clean object
    const statusMap = { Open: 0, 'In Progress': 0, Resolved: 0 };
    statusCounts.forEach(({ _id, count }) => {
      if (_id in statusMap) statusMap[_id] = count;
    });

    // Map category counts into a clean object
    const categoryMap = {};
    categoryCounts.forEach(({ _id, count }) => {
      if (_id) categoryMap[_id] = count;
    });

    const total = statusMap['Open'] + statusMap['In Progress'] + statusMap['Resolved'];

    res.status(200).json({
      total,
      open: statusMap['Open'],
      inProgress: statusMap['In Progress'],
      resolved: statusMap['Resolved'],
      byCategory: categoryMap,
      topUpvoted,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { getStats };
