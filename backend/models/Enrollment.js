import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLectures: [{
    sectionIndex: Number,
    lectureIndex: Number
  }],
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  certificateIssued: {
    type: Boolean,
    default: false
  },
  lastAccessedLecture: {
    sectionIndex: Number,
    lectureIndex: Number
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;