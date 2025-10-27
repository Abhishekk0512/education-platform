// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Please provide a name'],
//     trim: true
//   },
//   email: {
//     type: String,
//     required: [true, 'Please provide an email'],
//     unique: true,
//     lowercase: true,
//     match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
//   },
//   password: {
//     type: String,
//     required: [true, 'Please provide a password'],
//     minlength: 6,
//     select: false
//   },
//   role: {
//     type: String,
//     enum: ['student', 'teacher', 'admin'],
//     default: 'student'
//   },
//   bio: {
//     type: String,
//     maxlength: 500
//   },
//   photo: {
//     type: String,
//     default: 'https://via.placeholder.com/150'
//   },
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   isApproved: {
//     type: Boolean,
//     default: true // Auto-approve students, teachers need admin approval
//   },
//   resetPasswordToken: String,
//   resetPasswordExpire: Date
// }, {
//   timestamps: true
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) {
//     next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// // Match password
// userSchema.methods.matchPassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// const User = mongoose.model('User', userSchema);

// export default User;

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  bio: {
    type: String,
    maxlength: 500
  },
  photo: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve students, teachers need admin approval
  },
  verificationCode: {
    type: String,
    select: false
  },
  verificationCodeExpire: {
    type: Date,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate verification code
userSchema.methods.generateVerificationCode = function() {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash the code before storing
  this.verificationCode = bcrypt.hashSync(code, 10);
  
  // Set expiration to 10 minutes
  this.verificationCodeExpire = Date.now() + 10 * 60 * 1000;
  
  return code; // Return unhashed code to send via email
};

// Verify code
userSchema.methods.verifyCode = async function(enteredCode) {
  return await bcrypt.compare(enteredCode, this.verificationCode);
};

const User = mongoose.model('User', userSchema);

export default User;