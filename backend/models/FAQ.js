const mongoose = require('mongoose')

const FAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true,
    maxlength: 200
  },
  answer: {
    type: String,
    required: [true, 'Please provide an answer'],
    trim: true
  },
  category: {
    type: String,
    enum: ['General', 'Account', 'Employer', 'Support', 'Security'],
    default: 'General'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('FAQ', FAQSchema)
