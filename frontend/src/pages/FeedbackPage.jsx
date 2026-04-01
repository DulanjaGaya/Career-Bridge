import React, { useState, useEffect } from 'react'
import { Send, CheckCircle, AlertCircle, Trash2, Edit } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const FeedbackPage = () => {
  const { user, token } = useAuth()
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({ message: '', rating: 0, type: 'Other' })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()
      setFeedbackList(data.data || [])
    } catch (error) {
      console.error('Failed to fetch feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, message: e.target.value })
  }

  const handleRatingChange = (rating) => {
    setFormData({ ...formData, rating })
  }

  const handleTypeChange = (e) => {
    setFormData({ ...formData, type: e.target.value })
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()

    if (!formData.message.trim()) {
      setMessage({ type: 'error', text: 'Please enter your feedback' })
      return
    }

    if (!formData.rating || formData.rating === 0) {
      setMessage({ type: 'error', text: 'Please select a rating' })
      return
    }

    try {
      const url = editingId
        ? `/api/feedback/${editingId}`
        : '/api/feedback'

      const method = editingId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to submit')

      setMessage({
        type: 'success',
        text: editingId ? 'Feedback updated!' : 'Feedback submitted!'
      })

      setFormData({ message: '', rating: 0, type: 'Other' })
      setEditingId(null)
      fetchFeedback()

    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleEdit = (feedback) => {
    setFormData({ message: feedback.message, rating: feedback.rating, type: feedback.type })
    setEditingId(feedback._id)
  }

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure?')) return

    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete')

      setMessage({ type: 'success', text: 'Feedback deleted!' })
      fetchFeedback()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-blue">
      <Navbar />

      <div className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Feedback</h1>
            <p className="text-gray-300">Help us improve your system.</p>
          </div>

          {/* Messages */}
          {message.text && (
            <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
              message.type === 'success'
                ? 'bg-green-500/20 text-green-300'
                : 'bg-red-500/20 text-red-300'
            }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form - only for non-admin users */}
          {user && user?.role !== 'admin' && (
            <form onSubmit={handleSubmitFeedback} className="glass-effect p-6 rounded-lg mb-8">
              <textarea
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter feedback..."
                className="w-full mb-4 p-3 rounded bg-white/10 text-white"
              />

              {/* Rating Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating (Required)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingChange(rating)}
                      className={`text-2xl transition ${formData.rating >= rating ? 'opacity-100' : 'opacity-40'}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                >
                  <option value="Bug">Bug</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="UX">UX</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button className="bg-accent px-6 py-2 rounded flex items-center gap-2">
                <Send size={18} />
                {editingId ? 'Update' : 'Submit'}
              </button>
            </form>
          )}

          {/* Feedback List */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            feedbackList.map((feedback) => {
              const isOwner =
                feedback.userId?._id?.toString() === user?._id

              return (
                <div key={feedback._id} className="glass-effect p-6 mb-4 rounded-lg">
                  <p>{feedback.message}</p>

                  {/* Rating and Type */}
                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    <span>{'⭐'.repeat(feedback.rating)} ({feedback.rating}/5)</span>
                    <span>{feedback.type}</span>
                  </div>

                  <div className="flex justify-between items-center mt-3">

                    {/* User Name */}
                    <span className="text-sm text-gray-400">
                      {feedback.userId?.name}
                    </span>

                    <div className="flex gap-2">

                      {/* OWNER → Edit + Delete */}
                      {isOwner && (
                        <>
                          <button onClick={() => handleEdit(feedback)}>
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteFeedback(feedback._id)}>
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}

                      {/* ADMIN → Delete ONLY */}
                      {user?.role === 'admin' && (
                        <button onClick={() => handleDeleteFeedback(feedback._id)}>
                          <Trash2 size={18} />
                        </button>
                      )}

                    </div>
                  </div>
                </div>
              )
            })
          )}

        </div>
      </div>

      <Footer />
    </div>
  )
}

export default FeedbackPage