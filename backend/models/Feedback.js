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

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      index: true,
      default: null
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

   
  },
  { timestamps: true }
)

module.exports = mongoose.model('Feedback', feedbackSchema)