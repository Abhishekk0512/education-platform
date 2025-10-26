import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleAuth.js';

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = req.body.isApproved ?? user.isApproved;
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/courses/all
// @desc    Get all courses (approved and pending)
// @access  Private/Admin
router.get('/courses/all', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate('instructor', 'name email photo bio')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/courses/pending
// @desc    Get pending courses for approval
// @access  Private/Admin
router.get('/courses/pending', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const courses = await Course.find({ isApproved: false })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// @route   PUT /api/admin/courses/:id/approve
// @desc    Approve/reject course
// @access  Private/Admin
router.put('/courses/:id/approve', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.isApproved = req.body.isApproved;
    await course.save();

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Private/Admin
router.get('/analytics', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalCourses = await Course.countDocuments({ isApproved: true });
    const totalEnrollments = await Enrollment.countDocuments();
    const pendingCourses = await Course.countDocuments({ isApproved: false });
    const pendingTeachers = await User.countDocuments({ role: 'teacher', isApproved: false });

    res.json({
       totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      totalEnrollments,
      pendingCourses,
      pendingTeachers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;