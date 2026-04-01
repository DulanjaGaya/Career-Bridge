import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import EnhancedQAPage from './pages/EnhancedQAPage'
import AdvancedFeedbackPage from './pages/AdvancedFeedbackPage'
import FAQPage from './pages/FAQPage'
import AdminPage from './pages/AdminPage'

/**
 * ProtectedRoute - Wraps routes that require authentication
 */
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-blue flex items-center justify-center">
        <div className="text-gray-300">Loading...</div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

/**
 * AdminRoute - Wraps routes that require admin access
 */
const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-blue flex items-center justify-center">
        <div className="text-gray-300">Loading...</div>
      </div>
    )
  }

  return user && user.role === 'admin' ? children : <Navigate to="/" />
}

/**
 * App - Main application with routing
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/faq" element={<FAQPage />} />

          {/* Protected Routes */}
          <Route
            path="/qa"
            element={
              <ProtectedRoute>
                <EnhancedQAPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <AdvancedFeedbackPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
