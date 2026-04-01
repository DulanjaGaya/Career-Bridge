const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const {
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  updateFeedbackStatus,
  updateFeedbackPriority
} = require('../controllers/feedbackController');

// GET → Admin (all) + User (own)
router.get('/', auth, getFeedback);

// CREATE → User
router.post('/', auth, createFeedback);

// UPDATE → Owner only
router.patch('/:id', auth, updateFeedback);

// UPDATE STATUS → Admin only
router.patch('/:id/status', auth, updateFeedbackStatus);

// UPDATE PRIORITY → Admin only
router.patch('/:id/priority', auth, updateFeedbackPriority);

// DELETE → Admin OR Owner
router.delete('/:id', auth, deleteFeedback);

module.exports = router;