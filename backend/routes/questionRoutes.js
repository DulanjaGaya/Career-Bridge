/**
 * Question Routes
 */
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  upvoteQuestion,
  postAnswer,
  deleteAnswer
} = require('../controllers/questionController')

// GET /api/questions - Get all questions
router.get('/', getQuestions)

// POST /api/questions - Create new question (authenticated)
router.post('/', auth, createQuestion)

// More specific routes BEFORE generic :id routes
// POST /api/questions/:id/upvote - Upvote question
router.post('/:id/upvote', auth, upvoteQuestion)

// POST /api/questions/:id/answers - Post answer to question
router.post('/:id/answers', auth, postAnswer)

// DELETE /api/questions/:id/answers/:answerId - Delete answer
router.delete('/:id/answers/:answerId', auth, deleteAnswer)

// Generic :id routes AFTER specific ones
// PATCH /api/questions/:id - Update question (owner or admin)
router.patch('/:id', auth, updateQuestion)

// DELETE /api/questions/:id - Delete question (owner or admin)
router.delete('/:id', auth, deleteQuestion)

module.exports = router
