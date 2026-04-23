import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/**
 * SignupPage - User registration page
 * Handles user signup with name, email, password, and role selection
 */
const SignupPage = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill all fields' })
      return
    }

    // Name validation - must contain letters, no only numbers/symbols
    const trimmedName = formData.name.trim()
    if (trimmedName.length < 2) {
      setMessage({ type: 'error', text: 'Name can only contain letters and spaces' })
      return
    }

    if (trimmedName.length > 50) {
      setMessage({ type: 'error', text: 'Name must not exceed 50 characters' })
      return
    }

    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(trimmedName)) {
      setMessage({ type: 'error', text: 'Name can only contain letters and spaces' })
      return
    }

    // Only letters and spaces allowed
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setMessage({ type: 'error', text: 'Name can only contain letters and spaces' })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    if (formData.email.trim().length > 100) {
      setMessage({ type: 'error', text: 'Email must not exceed 100 characters' })
      return
    }

    // Password validation
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    if (formData.password.length > 128) {
      setMessage({ type: 'error', text: 'Password must not exceed 128 characters' })
      return
    }

    // Confirm password match
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    setLoading(true)
    try {
      const result = await signup(formData.name, formData.email, formData.password, formData.role)
      setLoading(false)

      if (result.success) {
        setMessage({ type: 'success', text: 'Account created! Redirecting to dashboard...' })
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setLoading(false)
      setMessage({ type: 'error', text: error.message || 'Signup failed' })
    }
  }

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'university', label: 'University' },
    { value: 'employer', label: 'Employer' }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-dark-blue">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="glass-effect p-8 rounded-xl space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-gray-300">Join Career Bridge and start your journey</p>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                  : 'bg-red-500/20 text-red-300 border border-red-500/50'
              }`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-lg px-4 py-3">
                  <User size={20} className="text-accent" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="bg-transparent flex-1 outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-lg px-4 py-3">
                  <Mail size={20} className="text-accent" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="bg-transparent flex-1 outline-none"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">I am a</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-accent"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value} className="bg-primary">
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-lg px-4 py-3">
                  <Lock size={20} className="text-accent" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-transparent flex-1 outline-none"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-lg px-4 py-3">
                  <Lock size={20} className="text-accent" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-transparent flex-1 outline-none"
                  />
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" required />
                I agree to the Terms of Service and Privacy Policy
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-dark-blue font-bold py-3 rounded-lg hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:text-orange-500 transition font-semibold">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default SignupPage
