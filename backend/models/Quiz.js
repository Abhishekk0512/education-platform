import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number, // Index of correct option
    points: {
      type: Number,
      default: 1
    }
  }],
  passingScore: {
    type: Number,
    default: 70
  },
  duration: {
    type: Number, // in minutes
    default: 30
  }
}, {
  timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;