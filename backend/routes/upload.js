import express from 'express';
import { uploadPDF, uploadVideo, uploadImage, uploadToCloudinary } from '../config/cloudinary.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleAuth.js';

const router = express.Router();

console.log('Upload routes loaded');

// @route   POST /api/upload/pdf
// @desc    Upload PDF file
// @access  Private/Teacher
router.post('/pdf', protect, authorizeRoles('teacher'), uploadPDF.single('pdf'), async (req, res) => {
  try {
    console.log('PDF upload request received');
    
    if (!req.file) {
      console.log('No PDF file in request');
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    console.log('Uploading PDF to Cloudinary...');
    
    // Upload to Cloudinary with proper PDF flags
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'education-platform/pdfs',
      resource_type: 'raw',
      public_id: `pdf_${Date.now()}`,
      format: 'pdf',
      type: 'upload',
      access_mode: 'public'
    });

    console.log('PDF uploaded successfully:', result.secure_url);
    
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload PDF' });
  }
});

// @route   POST /api/upload/video
// @desc    Upload video file
// @access  Private/Teacher
router.post('/video', protect, authorizeRoles('teacher'), uploadVideo.single('video'), async (req, res) => {
  try {
    console.log('Video upload request received');
    
    if (!req.file) {
      console.log('No video file in request');
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    console.log('Uploading video to Cloudinary...');
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'education-platform/videos',
      resource_type: 'video',
      public_id: `video_${Date.now()}`,
      chunk_size: 6000000, // 6MB chunks for large files
      timeout: 120000 // 2 minutes timeout
    });

    console.log('Video uploaded successfully:', result.secure_url);
    
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload video' });
  }
});

// @route   POST /api/upload/thumbnail
// @desc    Upload course thumbnail
// @access  Private/Teacher
router.post('/thumbnail', protect, authorizeRoles('teacher'), uploadImage.single('thumbnail'), async (req, res) => {
  try {
    console.log('Thumbnail upload request received');
    
    if (!req.file) {
      console.log('No thumbnail file in request');
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    console.log('Uploading thumbnail to Cloudinary...');
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'education-platform/thumbnails',
      resource_type: 'image',
      public_id: `thumbnail_${Date.now()}`,
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    console.log('Thumbnail uploaded successfully:', result.secure_url);
    
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Thumbnail upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload thumbnail' });
  }
});

// @route   POST /api/upload/profile-photo
// @desc    Upload profile photo
// @access  Private
router.post('/profile-photo', protect, uploadImage.single('photo'), async (req, res) => {
  try {
    console.log('Profile photo upload request received');
    
    if (!req.file) {
      console.log('No photo file in request');
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    console.log('Uploading profile photo to Cloudinary...');
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'education-platform/profile-photos',
      resource_type: 'image',
      public_id: `profile_${req.user._id}_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    console.log('Profile photo uploaded successfully:', result.secure_url);
    
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload profile photo' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  console.error('Upload error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File is too large' });
  }
  
  res.status(400).json({ message: error.message || 'Upload failed' });
});

export default router;