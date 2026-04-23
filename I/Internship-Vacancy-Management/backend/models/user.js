const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['employer', 'student', 'admin'],
    default: 'student'
  },
  // Employer specific fields
  company: {
    type: String,
    trim: true
  },
  // Student specific fields
  studentProfile: {
    university: String,
    degree: String,
    graduationYear: Number,
    skills: [String],
    resume: String,
    portfolio: String,
    phone: String,
    location: String,
    profilePicture: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);