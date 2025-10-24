import express from 'express';
import Quiz from '../models/Quiz.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleAuth.js';

const router = express.Router();

// @route   POST /api/quiz
// @desc    Create a quiz for a course
// @access  Private/Teacher
router.post('/', protect, authorizeRoles('teacher'), async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/quiz/course/:courseId
// @desc    Get quiz for a course
// @access  Private
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
    } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/quiz/:id/submit
// @desc    Submit quiz answers
// @access  Private/Student
router.post('/:id/submit', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    const { answers } = req.body; // Array of selected answer indices

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach((question, index) => {
      totalPoints += question.points;
      if (answers[index] === question.correctAnswer) {
        score += question.points;
      }
    });

    const percentage = (score / totalPoints) * 100;
    const passed = percentage >= quiz.passingScore;

    res.json({
      score,
      totalPoints,
      percentage: percentage.toFixed(2),
      passed,
      passingScore: quiz.passingScore
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;