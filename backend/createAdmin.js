/**
 * Script to manually create first admin in MongoDB
 * Run: node createAdmin.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')

// User Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'university', 'employer', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://career_user:Career1234@cluster0.8vmqsmp.mongodb.net/career-bridge?retryWrites=true&w=majority')
    console.log('✅ Connected to MongoDB!')

    // Check if admin already exists
    console.log('🔍 Checking for existing admin...')
    const existingAdmin = await User.findOne({ role: 'admin' })
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!')
      console.log('Admin Details:')
      console.log(`  Name: ${existingAdmin.name}`)
      console.log(`  Email: ${existingAdmin.email}`)
      console.log(`  Role: ${existingAdmin.role}`)
      process.exit(0)
    }

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcryptjs.hash('Admin@123456', 10)

    // Create admin user
    console.log('👤 Creating admin account...')
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@careerbridge.com',
      password: hashedPassword,
      role: 'admin'
    })

    // Save to database
    await admin.save()
    console.log('✅ Admin created successfully!')
    console.log('\n' + '='.repeat(50))
    console.log('ADMIN DETAILS:')
    console.log('='.repeat(50))
    console.log(`📧 Email: admin@careerbridge.com`)
    console.log(`🔑 Password: Admin@123456`)
    console.log(`👤 Name: System Administrator`)
    console.log(`🎯 Role: Admin`)
    console.log('='.repeat(50))
    console.log('\n⚠️  IMPORTANT: Change the password after first login!')
    process.exit(0)

  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    process.exit(1)
  }
}

createAdmin()
