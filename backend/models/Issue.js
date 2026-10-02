const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Electrical', 'Water', 'Cleanliness', 'Furniture', 'Internet', 'Other'],
        message: 'Category must be one of: Electrical, Water, Cleanliness, Furniture, Internet, Other',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'In Progress', 'Resolved'],
        message: 'Status must be one of: Open, In Progress, Resolved',
      },
      default: 'Open',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Array of User ObjectIds who have upvoted this issue
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Indexes for fast search/filter queries
issueSchema.index({ category: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ createdBy: 1 });
issueSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Issue', issueSchema);
