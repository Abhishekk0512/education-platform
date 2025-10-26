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
  thumbnail: {
    type: String,
    default: 'https://via.placeholder.com/400x300'
  },
  duration: {
    type: String, // e.g., "6 weeks", "3 months"
    required: true
  },
  // New structure: Sections and Lectures
  sections: [{
    title: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    lectures: [{
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        default: ''
      },
      videoUrl: {
        type: String,
        default: ''
      },
      pdfUrls: [{
        url: String,
        title: String
      }],
      content: {
        type: String, // Rich text content about the topic
        default: ''
      },
      duration: {
        type: String, // e.g., "19:20", "12:55"
        default: ''
      },
      order: {
        type: Number,
        required: true
      },
      isPreview: {
        type: Boolean,
        default: false
      }
    }]
  }],
  isApproved: {
    type: Boolean,
    default: false
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

// Virtual for total lectures count
courseSchema.virtual('totalLectures').get(function() {
  return this.sections.reduce((total, section) => total + section.lectures.length, 0);
});

// Virtual for total duration
courseSchema.virtual('totalDuration').get(function() {
  let totalMinutes = 0;
  this.sections.forEach(section => {
    section.lectures.forEach(lecture => {
      if (lecture.duration) {
        const parts = lecture.duration.split(':');
        if (parts.length === 2) {
          totalMinutes += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      }
    });
  });
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

const Course = mongoose.model('Course', courseSchema);

export default Course;