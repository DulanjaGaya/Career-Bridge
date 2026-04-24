import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/**
 * LoginPage - User login page
 * Handles email/password authentication
 */
const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Please fill all fields' })
      return
    }

    setLoading(true)
    try {
      const result = await login({ email: formData.email.trim(), password: formData.password })
      setLoading(false)

      if (result.success) {
        const redirectTo = result.user?.role === 'student'
          ? '/student/dashboard'
          : result.user?.role === 'employer'
            ? '/employer/dashboard'
            : '/browse-jobs'

        setMessage({ type: 'success', text: 'Login successful! Redirecting...' })
        setTimeout(() => navigate(redirectTo), 1200)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setLoading(false)
      setMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Login failed' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-dark-blue">
      <div className="w-full max-w-md">
        <div className="glass-effect p-8 rounded-xl space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to your Career Bridge account</p>
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

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                Remember me
              </label>
              <a href="#" className="text-accent hover:text-orange-500 transition">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-dark-blue font-bold py-3 rounded-lg hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center text-gray-300">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent hover:text-orange-500 transition font-semibold">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
