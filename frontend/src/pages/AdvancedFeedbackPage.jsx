import React, { useState, useMemo, useEffect } from 'react'
import { Send, MessageSquare, Star, Edit2, Trash2, Filter, TrendingUp, AlertCircle, X, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { validateFeedbackForm, validateComment, getCleanInput } from '../utils/validations'
import axios from 'axios'

/**
 * AdvancedFeedbackPage - Enhanced feedback with comments, ratings, analytics, admin edit/delete
 */
const AdvancedFeedbackPage = () => {
  const { user, token } = useAuth()
  const API_BASE_URL = 'http://localhost:5000/api'
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [newComment, setNewComment] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showNewFeedbackForm, setShowNewFeedbackForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingFeedback, setEditingFeedback] = useState(null)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [newFeedback, setNewFeedback] = useState({
    message: '',
    rating: 5,
    type: 'Other'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [editErrors, setEditErrors] = useState({})

  // Fetch feedbacks from API on mount
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/feedback`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.data.success) {
          setFeedbacks(response.data.data || [])
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching feedbacks:', err)
        setError('Failed to load feedbacks')
      } finally {
        setLoading(false)
      }
    }
    fetchFeedbacks()
  }, [])

  // Filter feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      const statusMatch = filterStatus === 'all' || f.status === filterStatus
      const typeMatch = filterType === 'all' || f.type === filterType
      return statusMatch && typeMatch
    })
  }, [feedbacks, filterStatus, filterType])

  // Analytics data
  const statusDistribution = [
    { name: 'in-progress', value: feedbacks.filter(f => f.status === 'in-progress').length },
    { name: 'resolved', value: feedbacks.filter(f => f.status === 'resolved').length }
  ]

  const typeDistribution = [
    { name: 'Bug', value: feedbacks.filter(f => f.type === 'Bug').length },
    { name: 'Feature', value: feedbacks.filter(f => f.type === 'Feature Request').length },
    { name: 'UX', value: feedbacks.filter(f => f.type === 'UX').length },
    { name: 'Other', value: feedbacks.filter(f => f.type === 'Other').length }
  ]

  const ratingData = [
    { rating: '⭐', count: feedbacks.filter(f => f.rating === 1).length },
    { rating: '⭐⭐', count: feedbacks.filter(f => f.rating === 2).length },
    { rating: '⭐⭐⭐', count: feedbacks.filter(f => f.rating === 3).length },
    { rating: '⭐⭐⭐⭐', count: feedbacks.filter(f => f.rating === 4).length },
    { rating: '⭐⭐⭐⭐⭐', count: feedbacks.filter(f => f.rating === 5).length }
  ]



  // Stats cards
  const stats = {
    total: feedbacks.length,
    avgRating: (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
  }

  const handleAddComment = () => {
    const validation = validateComment(newComment)
    if (!validation.valid) {
      alert(validation.error)
      return
    }
    
    if (selectedFeedback) {
      const cleanComment = getCleanInput(newComment)
      const updated = feedbacks.map(f => {
        if (f._id === selectedFeedback._id) {
          return {
            ...f,
            comments: [...f.comments, {
              id: f.comments.length + 1,
              author: user?.name || 'Anonymous',
              text: cleanComment,
              createdAt: new Date()
            }]
          }
        }
        return f
      })
      setFeedbacks(updated)
      setSelectedFeedback(updated.find(f => f._id === selectedFeedback._id))
      setNewComment('')
    }
  }

  const handleAddFeedback = async () => {
    const validation = validateFeedbackForm(newFeedback.message, newFeedback.rating, newFeedback.type)
    
    if (!validation.valid) {
      setFormErrors(validation.errors)
      return
    }
    
    try {
      const cleanMessage = getCleanInput(newFeedback.message)
      
      const response = await axios.post(
        `${API_BASE_URL}/feedback`,
        {
          message: cleanMessage,
          rating: Number(newFeedback.rating),
          type: newFeedback.type
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.data.success) {
        setFeedbacks([...feedbacks, response.data.data])
        setNewFeedback({ message: '', rating: 5, type: 'Other' })
        setFormErrors({})
        setShowNewFeedbackForm(false)
      }
    } catch (err) {
      console.error('Error adding feedback:', err)
      alert('Error adding feedback: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/feedback/${feedbackId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.data.success) {
        setFeedbacks(feedbacks.map(f => f._id === feedbackId ? { ...f, status: newStatus } : f))
        if (selectedFeedback?._id === feedbackId) {
          setSelectedFeedback({ ...selectedFeedback, status: newStatus })
        }
        setSuccessMessage('Status updated successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Error updating status: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleUpdatePriority = async (feedbackId, newPriority) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/feedback/${feedbackId}/priority`,
        { priority: newPriority },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.data.success) {
        setFeedbacks(feedbacks.map(f => f._id === feedbackId ? { ...f, priority: newPriority } : f))
        if (selectedFeedback?._id === feedbackId) {
          setSelectedFeedback({ ...selectedFeedback, priority: newPriority })
        }
        setSuccessMessage('Priority updated successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      console.error('Error updating priority:', err)
      alert('Error updating priority: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleEditFeedback = (feedback) => {
    setEditingFeedback({ ...feedback })
    setShowEditForm(true)
  }

  const handleSaveEdit = async () => {
    const validation = validateFeedbackForm(editingFeedback.message, editingFeedback.rating, editingFeedback.type)
    
    if (!validation.valid) {
      setEditErrors(validation.errors)
      return
    }

    setIsEditLoading(true)
    try {
      const cleanMessage = getCleanInput(editingFeedback.message)
      
      const response = await axios.patch(
        `${API_BASE_URL}/feedback/${editingFeedback._id}`,
        {
          message: cleanMessage,
          rating: Number(editingFeedback.rating),
          type: editingFeedback.type
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.data.success) {
        const updatedFeedback = response.data.data
        const updated = feedbacks.map(f => 
          f._id === editingFeedback._id ? updatedFeedback : f
        )
        setFeedbacks(updated)
        setSelectedFeedback(updatedFeedback)
        setShowEditForm(false)
        setEditingFeedback(null)
        setEditErrors({})
        setSuccessMessage('Feedback updated successfully!')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        throw new Error(response.data.message || 'Failed to update feedback')
      }
    } catch (err) {
      console.error('Error saving feedback:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save feedback'
      setEditErrors({ general: errorMsg })
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/feedback/${feedbackId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.data.success) {
        const updatedFeedbacks = feedbacks.filter(f => f._id !== feedbackId)
        setFeedbacks(updatedFeedbacks)
        setShowDeleteConfirm(false)
        
        // Auto-select next feedback if available
        if (updatedFeedbacks.length > 0) {
          setSelectedFeedback(updatedFeedbacks[0])
        } else {
          setSelectedFeedback(null)
        }
        
        setSuccessMessage('Feedback deleted successfully!')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      console.error('Error deleting feedback:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete feedback'
      alert('Error deleting feedback: ' + errorMsg)
    }
  }

  const COLORS = ['#1e3a8a', '#FF8C00', '#10b981', '#f59e0b']
  const PRIORITY_COLORS = { 'Low': '#10b981', 'High': '#ef4444' }
  const STATUS_COLORS = { 'in-progress': '#f59e0b', 'resolved': '#10b981' }

  return (
    <div className="min-h-screen flex flex-col bg-dark-blue">
      <Navbar />

      <div className="flex-1 px-6 py-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Feedback Management</h1>
          <p className="text-xl text-gray-300">Share your thoughts and help us improve</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 flex items-center gap-3 animate-in fade-in duration-300">
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <div className="glass-effect p-6 rounded-xl">
            <div className="text-gray-400 text-sm mb-2">Total Feedback</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="glass-effect p-6 rounded-xl border-l-4 border-accent">
            <div className="text-gray-400 text-sm mb-2">Avg Rating</div>
            <div className="text-3xl font-bold text-accent">⭐ {stats.avgRating}</div>
          </div>
        </div>

        {/* Submit Feedback Button - Only for non-admin users */}
        {!showNewFeedbackForm && user?.role !== 'admin' && (
          <button
            onClick={() => setShowNewFeedbackForm(true)}
            className="mb-8 bg-accent hover:bg-opacity-90 px-6 py-3 rounded-lg font-medium transition"
          >
            Submit Feedback
          </button>
        )}

        {/* Submit Feedback Form - Only for non-admin users */}
        {showNewFeedbackForm && user?.role !== 'admin' && (
          <div className="glass-effect p-6 rounded-xl mb-8">
            <h3 className="text-xl font-bold mb-4">Share Your Feedback</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={newFeedback.message}
                  onChange={(e) => {
                    setNewFeedback({ ...newFeedback, message: e.target.value })
                    if (formErrors.message) setFormErrors({ ...formErrors, message: null })
                  }}
                  placeholder="Tell us what you think..."
                  rows="4"
                  className={`w-full bg-white/10 border ${formErrors.message ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2 outline-none focus:border-accent resize-none`}
                />
                {formErrors.message && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {formErrors.message}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{newFeedback.message.length}/1000 characters</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => {
                          setNewFeedback({ ...newFeedback, rating })
                          if (formErrors.rating) setFormErrors({ ...formErrors, rating: null })
                        }}
                        className={`text-2xl transition ${newFeedback.rating >= rating ? 'opacity-100' : 'opacity-40'}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  {formErrors.rating && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {formErrors.rating}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={newFeedback.type}
                    onChange={(e) => {
                      setNewFeedback({ ...newFeedback, type: e.target.value })
                      if (formErrors.type) setFormErrors({ ...formErrors, type: null })
                    }}
                    className={`w-full bg-white/10 border text-white ${formErrors.type ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2 outline-none focus:border-accent`}
                  >
                    <option value="Bug" className="bg-primary text-white">Bug Report</option>
                    <option value="Feature Request" className="bg-primary text-white">Feature Request</option>
                    <option value="UX" className="bg-primary text-white">UX/Design</option>
                    <option value="Other" className="bg-primary text-white">Other</option>
                  </select>
                  {formErrors.type && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {formErrors.type}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNewFeedbackForm(false)
                    setFormErrors({})
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFeedback}
                  className="flex-1 bg-accent hover:bg-opacity-90 px-4 py-2 rounded-lg font-medium transition"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section - Admin Only */}
        {user?.role === 'admin' && (
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Status Distribution */}
          <div className="glass-effect p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-4">Feedback Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e3a8a', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Type Distribution */}
          <div className="glass-effect p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-4">Feedback Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: '#1e3a8a', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#FF8C00" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Rating Distribution */}
          <div className="glass-effect p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-4">Customer Ratings</h3>
            <div className="space-y-3">
              {ratingData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{data.rating}</span>
                  <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${(data.count / Math.max(...ratingData.map(r => r.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-accent">{data.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Filters */}
        <div className="mb-8">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-accent"
          >
            <option value="all" className="bg-primary">All Types</option>
            <option value="Bug" className="bg-primary">Bug</option>
            <option value="Feature Request" className="bg-primary">Feature Request</option>
            <option value="UX" className="bg-primary">UX/Design</option>
            <option value="Other" className="bg-primary">Other</option>
          </select>
        </div>

        {/* Feedbacks List */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feedback Items */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Feedback ({filteredFeedbacks.length})</h3>
            <div className="space-y-4">
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map(feedback => (
                  <div
                    key={feedback._id}
                    className={`glass-effect rounded-lg hover:bg-white/10 transition ${
                      selectedFeedback?._id === feedback._id ? 'bg-white/10 border-l-4 border-accent' : ''
                    }`}
                  >
                    <button
                      onClick={() => setSelectedFeedback(feedback)}
                      className="w-full text-left p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold line-clamp-1">{feedback.message}</p>
                          <p className="text-sm text-gray-400">{feedback.userId?.name || 'Anonymous'} • {feedback.type}</p>
                        </div>
                        <div className="text-xl">{'⭐'.repeat(feedback.rating)}</div>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: PRIORITY_COLORS[feedback.priority] + '20', color: PRIORITY_COLORS[feedback.priority] }}
                        >
                          {feedback.priority}
                        </span>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: STATUS_COLORS[feedback.status] + '20', color: STATUS_COLORS[feedback.status] }}
                        >
                          {feedback.status}
                        </span>
                      </div>
                    </button>

                    {/* Edit/Delete Buttons for Owner Only */}
                    {user?._id === feedback.userId?._id && (
                      <div className="px-4 pb-3 flex gap-2 border-t border-white/10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditFeedback(feedback)
                          }}
                          className="flex-1 flex items-center justify-center gap-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 px-3 py-2 rounded text-xs font-medium transition"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedFeedback(feedback)
                            setShowDeleteConfirm(true)
                          }}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 px-3 py-2 rounded text-xs font-medium transition"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No feedback matching filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Details & Comments */}
          {selectedFeedback && (
            <div className="md:col-span-1 glass-effect p-6 rounded-xl h-fit sticky top-24">
              <h3 className="text-lg font-bold mb-4">Details</h3>

              {/* Feedback Content */}
              <div className="space-y-4 mb-6 pb-6 border-b border-white/20">
                <p className="text-gray-300">{selectedFeedback.message}</p>
                <div>
                  <span className="text-sm text-gray-400">Rating: </span>
                  <span className="text-lg">{'⭐'.repeat(selectedFeedback.rating)}</span>
                </div>

                {/* Admin Controls */}
                {user?.role === 'admin' && (
                  <div className="space-y-3 pt-4 border-t border-white/20">
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Status</label>
                      <select
                      value={selectedFeedback.status || 'in-progress'}
                      onChange={(e) => handleUpdateStatus(selectedFeedback._id, e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
                    >
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Priority</label>
                      <select
                        value={selectedFeedback.priority}
                        onChange={(e) => handleUpdatePriority(selectedFeedback._id, e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
                      >
                        <option value="Low">Low</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* User Edit/Delete (Owner Only) */}
                {user?._id === selectedFeedback.userId?._id && (
                  <div className="flex gap-2 pt-4 border-t border-white/20">
                    <button
                      onClick={() => handleEditFeedback(selectedFeedback)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition flex items-center justify-center gap-2"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-medium transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare size={18} /> Comments ({selectedFeedback.comments.length})
                </h4>

                {/* Existing Comments */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedFeedback.comments?.map(comment => (
                    <div key={comment._id} className="bg-white/5 p-3 rounded">
                      <p className="text-sm font-medium text-accent">{comment.author || comment.userId?.name}</p>
                      <p className="text-sm text-gray-300 mt-1">{comment.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(comment.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2 pt-4 border-t border-white/20">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add a comment..."
                    className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  <button
                    onClick={handleAddComment}
                    className="bg-accent hover:bg-opacity-90 p-2 rounded transition"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Feedback Modal */}
        {showEditForm && editingFeedback && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Edit Feedback</h3>
                <button
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingFeedback(null)
                    setEditErrors({})
                  }}
                  className="hover:bg-white/10 p-2 rounded transition"
                >
                  <X size={20} />
                </button>
              </div>

              {editErrors.general && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {editErrors.general}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={editingFeedback.message}
                    onChange={(e) => {
                      setEditingFeedback({ ...editingFeedback, message: e.target.value })
                      if (editErrors.message) setEditErrors({ ...editErrors, message: null })
                    }}
                    rows="4"
                    className={`w-full bg-white/10 border rounded-lg px-4 py-2 outline-none focus:border-accent resize-none transition ${
                      editErrors.message ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {editErrors.message && <p className="text-red-400 text-xs mt-1">{editErrors.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <select
                    value={editingFeedback.rating || 5}
                    onChange={(e) => {
                      setEditingFeedback({ ...editingFeedback, rating: Number(e.target.value) })
                      if (editErrors.rating) setEditErrors({ ...editErrors, rating: null })
                    }}
                    className={`w-full bg-white/10 border rounded-lg px-4 py-2 text-white outline-none focus:border-accent transition ${
                      editErrors.rating ? 'border-red-500' : 'border-white/20'
                    }`}
                  >
                    <option value="1" className="bg-primary text-white">⭐ Poor</option>
                    <option value="2" className="bg-primary text-white">⭐⭐ Fair</option>
                    <option value="3" className="bg-primary text-white">⭐⭐⭐ Good</option>
                    <option value="4" className="bg-primary text-white">⭐⭐⭐⭐ Very Good</option>
                    <option value="5" className="bg-primary text-white">⭐⭐⭐⭐⭐ Excellent</option>
                  </select>
                  {editErrors.rating && <p className="text-red-400 text-xs mt-1">{editErrors.rating}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={editingFeedback.type}
                    onChange={(e) => {
                      setEditingFeedback({ ...editingFeedback, type: e.target.value })
                      if (editErrors.type) setEditErrors({ ...editErrors, type: null })
                    }}
                    className={`w-full bg-white/10 border rounded-lg px-4 py-2 text-white outline-none focus:border-accent transition ${
                      editErrors.type ? 'border-red-500' : 'border-white/20'
                    }`}
                  >
                    <option value="Bug" className="bg-primary text-white">Bug Report</option>
                    <option value="Feature Request" className="bg-primary text-white">Feature Request</option>
                    <option value="UX" className="bg-primary text-white">UX/Design</option>
                    <option value="Other" className="bg-primary text-white">Other</option>
                  </select>
                  {editErrors.type && <p className="text-red-400 text-xs mt-1">{editErrors.type}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEditForm(false)
                      setEditingFeedback(null)
                      setEditErrors({})
                    }}
                    disabled={isEditLoading}
                    className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isEditLoading}
                    className="flex-1 bg-accent hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition"
                  >
                    {isEditLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedFeedback && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Delete Feedback</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="hover:bg-white/10 p-2 rounded transition"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this feedback? This action cannot be undone.
              </p>

              <p className="text-sm text-gray-400 mb-6 p-3 bg-white/5 rounded border border-white/10">
                "{selectedFeedback.message.substring(0, 100)}{selectedFeedback.message.length > 100 ? '...' : ''}"
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteFeedback(selectedFeedback._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default AdvancedFeedbackPage
