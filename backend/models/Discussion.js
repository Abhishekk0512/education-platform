import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: 2000
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    default: null // null means it's a top-level comment, not a reply
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isPinned: {
    type: Boolean,
    default: false // Admins and teachers can pin important comments
  }
}, {
  timestamps: true
});

// Index for faster queries
discussionSchema.index({ course: 1, createdAt: -1 });
discussionSchema.index({ parentComment: 1 });

// Virtual for replies count
discussionSchema.virtual('repliesCount', {
  ref: 'Discussion',
  localField: '_id',
  foreignField: 'parentComment',
  count: true
});

discussionSchema.set('toJSON', { virtuals: true });
discussionSchema.set('toObject', { virtuals: true });

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;