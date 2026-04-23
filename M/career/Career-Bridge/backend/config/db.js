/**
 * Database Configuration
 * Establishes MongoDB connection
 */
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/career-bridge', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('⚠️  MongoDB connection failed - running in demo mode')
    console.error('To enable full functionality, set up MongoDB Atlas or install MongoDB locally')
  }
}

module.exports = connectDB
