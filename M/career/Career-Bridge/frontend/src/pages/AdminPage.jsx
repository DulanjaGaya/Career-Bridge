import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/**
 * AdminPage - User Management for Admins
 * View, create, update, and delete users
 * Manage user roles
 */
const AdminPage = () => {
  const { user, token } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student'
  })
  const [formErrors, setFormErrors] = useState({})

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/'
    }
  }, [user])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setUsers(data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    // Name validation
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Name must not exceed 50 characters'
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errors.name = 'Name can only contain letters and spaces'
    }

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address'
    } else if (formData.email.trim().length > 100) {
      errors.email = 'Email must not exceed 100 characters'
    }

    // Role validation
    if (!formData.role) {
      errors.role = 'Please select a role'
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setMessage({ type: 'error', text: 'Please fix all fields' })
      return
    }
    setFormErrors({})

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/users/${editingId}` : '/api/users'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save user')

      setMessage({
        type: 'success',
        text: editingId ? 'User updated successfully!' : 'User created successfully!'
      })

      setFormData({ name: '', email: '', role: 'student' })
      setEditingId(null)
      setShowForm(false)
      fetchUsers()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleEdit = (userItem) => {
    setFormData({
      name: userItem.name,
      email: userItem.email,
      role: userItem.role
    })
    setEditingId(userItem._id)
    setShowForm(true)
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to delete user')

      setMessage({ type: 'success', text: 'User deleted successfully!' })
      fetchUsers()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', email: '', role: 'student' })
    setFormErrors({})
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-blue">
      <Navbar />

      <div className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-gray-300">Manage users</p>
          </div>

          {message.text && (
            <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
              message.type === 'success'
                ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                : 'bg-red-500/20 text-red-300 border border-red-500/50'
            }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* New User Button */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-accent text-dark-blue font-bold px-6 py-2 rounded-lg hover:bg-orange-500 transition flex items-center gap-2 mb-8"
            >
              <Plus size={20} />
              {showForm ? 'Cancel' : 'Add New User'}
            </button>
          </div>

          {/* User Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="glass-effect p-6 rounded-lg mb-8 space-y-4">
              <h3 className="text-xl font-bold">
                {editingId ? 'Edit User' : 'Create New User'}
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white outline-none focus:border-accent transition ${
                      formErrors.name ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white outline-none focus:border-accent transition ${
                      formErrors.email ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white outline-none focus:border-accent transition ${
                    formErrors.role ? 'border-red-500' : 'border-white/20'
                  }`}
                >
                  <option value="student" className="bg-primary">Student</option>
                  <option value="university" className="bg-primary">University</option>
                <option value="employer" className="bg-primary">Employer</option>
                <option value="admin" className="bg-primary">Admin</option>
                </select>
                {formErrors.role && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {formErrors.role}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-accent text-dark-blue font-bold px-6 py-2 rounded-lg hover:bg-orange-500 transition"
                >
                  {editingId ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border-2 border-accent text-accent px-6 py-2 rounded-lg hover:bg-accent/10 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Users Table */}
          <div className="glass-effect rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Name</th>
                      <th className="px-6 py-3 text-left font-semibold">Email</th>
                      <th className="px-6 py-3 text-left font-semibold">Role</th>
                      <th className="px-6 py-3 text-left font-semibold">Joined</th>
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(userItem => (
                      <tr key={userItem._id} className="border-b border-white/10 hover:bg-white/5 transition">
                        <td className="px-6 py-4">{userItem.name}</td>
                        <td className="px-6 py-4 text-gray-300">{userItem.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            userItem.role === 'admin'
                              ? 'bg-red-500/20 text-red-300'
                              : userItem.role === 'employer'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {new Date(userItem.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(userItem)}
                            className="text-accent hover:text-orange-500 transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(userItem._id)}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default AdminPage
