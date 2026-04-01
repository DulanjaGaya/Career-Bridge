import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/**
 * Navbar - Navigation component with authentication state
 * Displays different options based on user login status and role
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-primary/80 backdrop-blur-md border-b border-accent/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold gradient-text">
          Career Bridge
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 items-center">
          <Link to="/" className="hover:text-accent transition">Home</Link>
          <Link to="/faq" className="hover:text-accent transition">FAQ</Link>
          {user && <Link to="/qa" className="hover:text-accent transition">Q&A</Link>}
          {user && <Link to="/feedback" className="hover:text-accent transition">Feedback</Link>}
         
          
          {user ? (
            <div className="flex gap-4 items-center">
              <span className="text-sm text-accent">{user.name} ({user.role})</span>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-accent hover:text-orange-500 transition">Admin</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-accent text-dark-blue px-4 py-2 rounded-lg font-semibold hover:bg-orange-500 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="text-accent hover:text-orange-500 transition">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-accent text-dark-blue px-4 py-2 rounded-lg font-semibold hover:bg-orange-500 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-accent"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-primary/95 border-t border-accent/20 p-4 space-y-4">
          <Link to="/" className="block hover:text-accent transition">Home</Link>
          <Link to="/faq" className="block hover:text-accent transition">FAQ</Link>
          {user && <Link to="/qa" className="block hover:text-accent transition">Q&A</Link>}
          {user && <Link to="/feedback" className="block hover:text-accent transition">Feedback</Link>}
          
          
          {user ? (
            <>
              <div className="text-sm text-accent py-2">{user.name} ({user.role})</div>
              {user.role === 'admin' && (
                <Link to="/admin" className="block text-accent hover:text-orange-500 transition">Admin</Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full bg-accent text-dark-blue px-4 py-2 rounded-lg font-semibold hover:bg-orange-500 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link to="/login" className="block text-accent hover:text-orange-500 transition text-center">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="block bg-accent text-dark-blue px-4 py-2 rounded-lg font-semibold hover:bg-orange-500 transition text-center"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
