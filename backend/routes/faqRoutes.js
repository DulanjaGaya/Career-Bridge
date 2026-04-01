/**
 * FAQ Routes
 */
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  upvoteFAQ
} = require('../controllers/faqController')

// GET /api/faqs - Get all FAQs
router.get('/', getFAQs)

// GET /api/faqs/:id - Get single FAQ
router.get('/:id', getFAQ)

// POST /api/faqs - Create FAQ (admin only)
router.post('/', auth, createFAQ)

// PATCH /api/faqs/:id - Update FAQ (admin only)
router.patch('/:id', auth, updateFAQ)

// DELETE /api/faqs/:id - Delete FAQ (admin only)
router.delete('/:id', auth, deleteFAQ)

// POST /api/faqs/:id/upvote - Upvote FAQ
router.post('/:id/upvote', upvoteFAQ)

module.exports = router
