/**
 * User Routes
 */
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController')

// GET /api/users - Get all users (admin only)
router.get('/', auth, authorize('admin'), getUsers)

// POST /api/users - Create new user (admin only)
router.post('/', auth, authorize('admin'), createUser)

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', auth, authorize('admin'), updateUser)

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', auth, authorize('admin'), deleteUser)

module.exports = router
