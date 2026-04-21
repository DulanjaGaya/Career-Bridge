/**
 * Question Model
 * Defines question schema with title, description, answers, and upvotes
 */
const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a description']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [answerSchema],
    upvotes: {
      type: Number,
      default: 0
    },
    upvoters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isDeleted: {
      type: Boolean,
      default: false
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Open', 'Answered', 'Resolved'],
      default: 'Open'
    }
  },
  { timestamps: true }
)

// Persist questions into the 'UserQuestions' collection so user-submitted
// questions appear under the requested collection in the database.
module.exports = mongoose.model('Question', questionSchema, 'UserQuestions')
