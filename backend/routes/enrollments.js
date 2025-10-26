import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleAuth.js';

const router = express.Router();

// @route   POST /api/enrollments
// @desc    Enroll in a course
// @access  Private/Student
router.post('/', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId
    });

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/enrollments/my-courses
// @desc    Get student's enrolled courses
// @access  Private/Student
router.get('/my-courses', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name email photo' }
      })
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/enrollments/:id/progress
// @desc    Update course progress
// @access  Private/Student
router.put('/:id/progress', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const { completedLectures, progress } = req.body;

    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      student: req.user._id
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Update completed lectures
    enrollment.completedLectures = completedLectures;
    enrollment.progress = progress;

    // If progress is 100% and not completed yet, mark as completed
    if (progress >= 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
      enrollment.certificateIssued = true;
    }

    // If progress drops below 100%, remove completion
    if (progress < 100 && enrollment.completedAt) {
      enrollment.completedAt = undefined;
      enrollment.certificateIssued = false;
    }

    await enrollment.save();
    
    // Return populated enrollment
    const updatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name email photo' }
      });

    res.json(updatedEnrollment);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/enrollments/course/:courseId/students
// @desc    Get students enrolled in a course
// @access  Private/Teacher
router.get('/course/:courseId/students', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'name email photo')
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;