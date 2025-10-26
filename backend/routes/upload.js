import express from 'express';
import { uploadPDF, uploadVideo, uploadImage } from '../config/cloudinary.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleAuth.js';

const router = express.Router();

console.log('Upload routes loaded'); // Debug log

// @route   POST /api/upload/pdf
// @desc    Upload PDF file
// @access  Private/Teacher
router.post('/pdf', protect, authorizeRoles('teacher'), uploadPDF.single('pdf'), (req, res) => {
  try {
    console.log('PDF upload request received');
    
    if (!req.file) {
      console.log('No PDF file in request');
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    console.log('PDF uploaded successfully:', req.file.path);
    
    res.json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/upload/video
// @desc    Upload video file
// @access  Private/Teacher
router.post('/video', protect, authorizeRoles('teacher'), uploadVideo.single('video'), (req, res) => {
  try {
    console.log('Video upload request received');
    
    if (!req.file) {
      console.log('No video file in request');
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    console.log('Video uploaded successfully:', req.file.path);
    
    res.json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/upload/thumbnail
// @desc    Upload course thumbnail
// @access  Private/Teacher
router.post('/thumbnail', protect, authorizeRoles('teacher'), uploadImage.single('thumbnail'), (req, res) => {
  try {
    console.log('Thumbnail upload request received');
    
    if (!req.file) {
      console.log('No thumbnail file in request');
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    console.log('Thumbnail uploaded successfully:', req.file.path);
    
    res.json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Thumbnail upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  console.error('Multer error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File is too large' });
  }
  
  res.status(400).json({ message: error.message });
});

export default router;