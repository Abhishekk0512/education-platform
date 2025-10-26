import express from 'express';
import Discussion from '../models/Discussion.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleAuth.js';

const router = express.Router();

// @route   GET /api/discussions/course/:courseId
// @desc    Get all discussions for a course
// @access  Public
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Get top-level comments (not replies)
    const discussions = await Discussion.find({ 
      course: courseId, 
      parentComment: null 
    })
      .populate('user', 'name photo role')
      .sort({ isPinned: -1, createdAt: -1 });

    // For each discussion, get its replies
    const discussionsWithReplies = await Promise.all(
      discussions.map(async (discussion) => {
        const replies = await Discussion.find({ parentComment: discussion._id })
          .populate('user', 'name photo role')
          .sort({ createdAt: 1 });
        
        return {
          ...discussion.toObject(),
          replies
        };
      })
    );

    res.json(discussionsWithReplies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/discussions
// @desc    Create a new comment or reply
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { courseId, content, parentCommentId } = req.body;

    if (!content || !courseId) {
      return res.status(400).json({ message: 'Course ID and content are required' });
    }

    const discussion = await Discussion.create({
      course: courseId,
      user: req.user._id,
      content,
      parentComment: parentCommentId || null
    });

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('user', 'name photo role');

    res.status(201).json(populatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/discussions/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (discussion.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    discussion.content = req.body.content || discussion.content;
    discussion.isEdited = true;
    discussion.editedAt = new Date();

    const updatedDiscussion = await discussion.save();
    const populatedDiscussion = await Discussion.findById(updatedDiscussion._id)
      .populate('user', 'name photo role');

    res.json(populatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/discussions/:id
// @desc    Delete a comment
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Allow deletion if user is admin or comment owner
    const isOwner = discussion.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete all replies to this comment
    await Discussion.deleteMany({ parentComment: discussion._id });
    
    // Delete the comment itself
    await discussion.deleteOne();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/discussions/:id/pin
// @desc    Pin/unpin a comment
// @access  Private (Admin or Teacher)
router.put('/:id/pin', protect, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('user', 'name photo role');

    res.json(populatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/discussions/:id/replies
// @desc    Get replies for a specific comment
// @access  Public
router.get('/:id/replies', async (req, res) => {
  try {
    const replies = await Discussion.find({ parentComment: req.params.id })
      .populate('user', 'name photo role')
      .sort({ createdAt: 1 });

    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;