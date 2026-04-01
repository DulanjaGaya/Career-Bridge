/**
 * Career Bridge Backend Server
 * Main entry point for the API
 * 
 * Features:
 * - JWT-based authentication
 * - User role-based authorization
 * - RESTful API endpoints for:
 *   - Authentication (signup, login)
 *   - User management (admin only)
 *   - Questions & answers (upvotes)
 *   - Feedback management
 */
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

// Import routes
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const questionRoutes = require('./routes/questionRoutes')
const feedbackRoutes = require('./routes/feedbackRoutes')
const faqRoutes = require('./routes/faqRoutes')
const bootstrapRoutes = require('./routes/bootstrapRoutes')

// Connect to database (optional - can work without MongoDB for demo)
connectDB().catch(err => {
  console.log('⚠️  MongoDB connection failed - running in demo mode')
  console.log('To enable full functionality, set up MongoDB Atlas or install locally')
})

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/faqs', faqRoutes)
app.use('/api', bootstrapRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Career Bridge API is running' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Career Bridge Backend running on port ${PORT}`)
  console.log(`Make sure MongoDB is running on ${process.env.MONGODB_URI || 'mongodb://localhost:27017/career-bridge'}`)
})
