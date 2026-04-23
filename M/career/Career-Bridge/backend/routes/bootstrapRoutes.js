/**
 * Bootstrap Route - Create first admin account
 * One-time use endpoint to initialize the system with an admin
 */
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcryptjs = require('bcryptjs')

/**
 * POST /bootstrap-admin
 * Creates the first admin account
 * Only works if no admins exist in the database
 */
router.post('/bootstrap-admin', async (req, res) => {
  try {
    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' })
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An admin account already exists. Cannot create another admin via bootstrap.'
      })
    }

    // Create first admin
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@careerbridge.com',
      password: 'Admin@123456', // Default password (recommend changing after login)
      role: 'admin'
    })

    // Save admin (password will be hashed by pre-save hook)
    await admin.save()

    res.status(201).json({
      success: true,
      message: 'First admin account created successfully!',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      credentials: {
        email: 'admin@careerbridge.com',
        password: 'Admin@123456',
        note: 'Please change this password after first login!'
      }
    })
  } catch (error) {
    console.error('Bootstrap admin error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create admin account',
      error: error.message
    })
  }
})

module.exports = router
