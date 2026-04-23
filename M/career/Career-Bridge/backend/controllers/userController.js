/**
 * User Controller
 * Handles user management (create, read, update, delete)
 */
const User = require('../models/User')

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email) {
      return res.status(400).json({ message: 'Please provide name and email' })
    }

    // Generate default password if not provided
    const userPassword = password || 'Welcome@123'

    const user = await User.create({
      name,
      email,
      password: userPassword,
      role: role || 'student'
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role } = req.body

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByIdAndDelete(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
