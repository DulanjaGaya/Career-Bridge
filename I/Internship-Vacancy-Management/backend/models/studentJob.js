const mongoose = require('mongoose');

const studentJobSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true,
  },
  // Application-related fields
  hasApplied: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'viewed', 'reviewed', 'interview', 'accepted', 'rejected'],
    default: 'pending',
  },
  coverLetter: {
    type: String,
  },
  resumePath: {
    type: String,
  },
  appliedAt: {
    type: Date,
  },
  // Employer-side response timestamp (set once on first employer action: viewed/interview/accepted/rejected)
  employerRespondedAt: {
    type: Date,
  },
  // Saved-job related fields
  isSaved: {
    type: Boolean,
    default: false,
  },
  savedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

studentJobSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('StudentJob', studentJobSchema);
