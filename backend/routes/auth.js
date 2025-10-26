import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import generateToken from '../utils/generateToken.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Register User
router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'teacher'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name, email, password, role,
      isApproved: role === 'student',
      verificationCode: code
    });

    await sendEmail(email, 'Verify your email', `Your verification code is ${code}`);

    res.status(201).json({
      message: 'Verification code sent to your email. Please verify to complete registration.',
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify code
router.post('/verify', async (req, res) => {
  const { userId, code } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.isVerified) return res.json({ message: 'Already verified' });

    if (user.verificationCode === code) {
      user.isVerified = true;
      user.verificationCode = undefined;
      await user.save();

      res.json({
        message: 'Email verified successfully!',
        token: generateToken(user._id),
        user
      });
    } else {
      res.status(400).json({ message: 'Invalid code' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
