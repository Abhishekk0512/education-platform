import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test configuration
console.log('Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✓' : '✗',
  api_key: process.env.CLOUDINARY_API_KEY ? '✓' : '✗',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✓' : '✗'
});

// Storage for PDFs
const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'education-platform/pdfs',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
    public_id: (req, file) => `pdf_${Date.now()}`
  }
});

// Storage for Videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'education-platform/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
    public_id: (req, file) => `video_${Date.now()}`
  }
});

// Storage for Images (thumbnails)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'education-platform/thumbnails',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
    public_id: (req, file) => `thumbnail_${Date.now()}`
  }
});

// Create multer upload instances
export const uploadPDF = multer({
  storage: pdfStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for PDFs
  }
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
});

export const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
});

export default cloudinary;