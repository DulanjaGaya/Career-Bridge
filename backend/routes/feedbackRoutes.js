const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const {
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedbackController');

// GET → Admin (all) + User (own)
router.get('/', auth, getFeedback);

// CREATE → User
router.post('/', auth, createFeedback);

// UPDATE → Owner only
router.patch('/:id', auth, updateFeedback);

// DELETE → Admin OR Owner
router.delete('/:id', auth, deleteFeedback);

module.exports = router;