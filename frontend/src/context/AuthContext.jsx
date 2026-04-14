import React, { createContext, useContext, useState, useEffect } from 'react'

/**
 * AuthContext - Manages user authentication state
 * Provides methods for login, logout, and signup
 */
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  // Check if user is logged in on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Login user
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' }
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  // Signup user
  const signup = async (name, email, password, role = 'student') => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || 'Signup failed' }
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: error.message || 'Signup failed' }
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, register: signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
