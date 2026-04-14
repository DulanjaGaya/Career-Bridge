/**
 * Feedback Model
 * Defines feedback schema with message, user, and status
 */

const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Please provide feedback'],
      trim: true,
      minlength: 5,
      maxlength: 1000
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    type: {
      type: String,
      enum: ['Bug', 'Feature Request', 'UX', 'Other'],
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // ⚠️ Admin-related fields (read-only for users)
    status: {
      type: String,
      enum: ['in-progress', 'resolved'],
      default: 'in-progress'
    },

    response: {
      type: String,
      default: null
    },

    priority: {
      type: String,
      enum: ['Low', 'High'],
      default: 'Low'
    },

    // 💬 Comments (optional feature)
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        text: {
          type: String,
          required: true,
          trim: true
        },
        author: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Feedback', feedbackSchema)