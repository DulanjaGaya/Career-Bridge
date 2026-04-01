/**
 * Feedback Controller
 * Handles feedback submission and management
 */

const Feedback = require('../models/Feedback')

// 🔹 GET FEEDBACK (Admin → all, User → own)
exports.getFeedback = async (req, res) => {
  try {
    let feedback;

    if (req.user.role === 'admin') {
      // Admin → get ALL feedback
      feedback = await Feedback.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // User → get ONLY own feedback
      feedback = await Feedback.find({ userId: req.user._id })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

// 🔹 CREATE FEEDBACK (User only)
exports.createFeedback = async (req, res) => {
  try {
    const { message, rating, type } = req.body;

    // ❗ Prevent admin from creating
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin cannot create feedback'
      });
    }

    // Validate message
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback message is required'
      });
    }

    if (!/[a-zA-Z]/.test(message)) {
      return res.status(400).json({
        success: false,
        message: 'Feedback must contain at least one letter'
      });
    }

    if (message.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Feedback must be at least 5 characters'
      });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Feedback must not exceed 1000 characters'
      });
    }

    // Validate rating
    if (!rating || isNaN(Number(rating))) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required'
      });
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Validate type
    const validTypes = ['Bug', 'Feature Request', 'UX', 'Other'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback type'
      });
    }

    const feedback = await Feedback.create({
      message: message.trim(),
      rating: ratingNum,
      type,
      userId: req.user._id
    });

    await feedback.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating feedback',
      error: error.message
    });
  }
};

// 🔹 UPDATE FEEDBACK (Owner ONLY)
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, rating, type } = req.body;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // ❗ Owner ONLY (Admin cannot update)
    if (feedback.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this feedback'
      });
    }

    // Validate message (if updating)
    if (message) {
      if (!/[a-zA-Z]/.test(message)) {
        return res.status(400).json({
          success: false,
          message: 'Feedback must contain at least one letter'
        });
      }

      if (message.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Feedback must be at least 5 characters'
        });
      }
    }

    const updated = await Feedback.findByIdAndUpdate(
      id,
      {
        ...(message && { message: message.trim() }),
        ...(rating && { rating: Number(rating) }),
        ...(type && { type })
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating feedback',
      error: error.message
    });
  }
};

// 🔹 DELETE FEEDBACK (Admin OR Owner)
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // ✅ Admin OR Owner
    if (
      req.user.role === 'admin' ||
      feedback.userId.toString() === req.user._id.toString()
    ) {
      await Feedback.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'Feedback deleted successfully'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this feedback'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  }
};