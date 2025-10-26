import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user and send verification code
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher']).withMessage('Invalid role')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user (not verified yet)
    const user = await User.create({
      name,
      email,
      password,
      role,
      isApproved: role === 'student' ? true : false,
      isVerified: false
    });

    // Generate verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Send verification email
    const message = `
      <h1>Email Verification</h1>
      <p>Hello ${name},</p>
      <p>Thank you for registering on our Education Platform!</p>
      <p>Your verification code is: <strong style="font-size: 24px; color: #4F46E5;">${verificationCode}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't create this account, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification Code',
        message: `Your verification code is: ${verificationCode}`,
        html: message
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email for verification code.',
        userId: user._id,
        email: user.email
      });
    } catch (emailError) {
      // If email fails, delete the user
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ 
        message: 'Error sending verification email. Please try again.' 
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with code
// @access  Public
router.post('/verify-email', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid verification code')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, code } = req.body;

  try {
    const user = await User.findOne({ 
      email,
      verificationCode: code,
      verificationCodeExpire: { $gt: Date.now() }
    }).select('+verificationCode +verificationCodeExpire');

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification code' 
      });
    }

    // Verify user
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      isVerified: user.isVerified,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification code
// @access  Public
router.post('/resend-verification', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email, isVerified: false });

    if (!user) {
      return res.status(400).json({ 
        message: 'User not found or already verified' 
      });
    }

    // Generate new verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Send verification email
    const message = `
      <h1>Email Verification</h1>
      <p>Hello ${user.name},</p>
      <p>Your new verification code is: <strong style="font-size: 24px; color: #4F46E5;">${verificationCode}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Email Verification Code - Resent',
      message: `Your verification code is: ${verificationCode}`,
      html: message
    });

    res.json({
      success: true,
      message: 'Verification code resent successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Check if email is verified
      if (!user.isVerified) {
        return res.status(401).json({ 
          message: 'Please verify your email before logging in',
          needsVerification: true,
          email: user.email
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
        bio: user.bio,
        isApproved: user.isApproved,
        isVerified: user.isVerified,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio || user.bio;
      user.photo = req.body.photo || user.photo;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        photo: updatedUser.photo,
        bio: updatedUser.bio
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;