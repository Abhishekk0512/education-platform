import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description']
  },
  category: {
    type: String,
    required: true,
    enum: ['AI', 'Data Science', 'Web Development', 'Mobile Development', 'Cybersecurity', 'Cloud Computing', 'Other']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  syllabus: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: 'https://via.placeholder.com/400x300'
  },
  duration: {
    type: String, // e.g., "6 weeks", "3 months"
    required: true
  },
  lessons: [{
    title: String,
    content: String,
    videoUrl: String,
    pdfUrl: String,
    order: Number
  }],
  isApproved: {
    type: Boolean,
    default: false // Requires admin approval
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

export default Course;