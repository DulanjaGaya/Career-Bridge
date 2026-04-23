import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Send, Star, Edit2, Trash2, Filter, TrendingUp, AlertCircle, X, CheckCircle, Search, Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { validateFeedbackForm, getCleanInput } from '../utils/validations'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * AdvancedFeedbackPage - Enhanced feedback with ratings, analytics, admin edit/delete
 */
const AdvancedFeedbackPage = () => {
  const { user, token } = useAuth()
  const API_BASE_URL = 'http://localhost:5000/api'
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Advanced Filters State
  const [filterType, setFilterType] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sortOption, setSortOption] = useState('newest')
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFeedbacks, setTotalFeedbacks] = useState(0)
  const limit = 10

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

  // Fetch feedbacks from API
  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit,
        type: filterType,
        search: searchKeyword,
        fromDate,
        toDate,
        rating: ratingFilter,
        sort: sortOption
      }
      
      const response = await axios.get(`${API_BASE_URL}/feedback`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.data.success) {
        setFeedbacks(response.data.data || [])
        setTotalPages(response.data.pages || 1)
        setTotalFeedbacks(response.data.total || 0)
        setError(null)
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err)
      setError('Failed to load feedbacks')
    } finally {
      setLoading(false)
    }
  }, [currentPage, filterType, searchKeyword, fromDate, toDate, ratingFilter, sortOption])

  useEffect(() => {
    fetchFeedbacks()
  }, [fetchFeedbacks])

  // Clear pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, searchKeyword, fromDate, toDate, ratingFilter, sortOption])

  // Note: Filtering is now handled on the backend via fetchFeedbacks.
  // We use the 'feedbacks' state directly which contains the paginated/filtered data.

  // Analytics data
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
        // Refresh the current page
        fetchFeedbacks()
        setShowDeleteConfirm(false)
        setSelectedFeedback(null)
        
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

  // 🔹 EXPORT CSV
  const handleExportCSV = () => {
    if (feedbacks.length === 0) return alert('No data to export')

    const headers = ['Title/Message', 'Username', 'Type', 'Rating', 'Date']
    const csvData = feedbacks.map(f => [
      `"${f.message.replace(/"/g, '""')}"`,
      `"${f.userId?.name || 'Anonymous'}"`,
      f.type,
      f.rating,
      new Date(f.createdAt).toLocaleDateString()
    ])

    const csvContent = [headers, ...csvData].map(e => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `feedback_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 🔹 EXPORT PDF
  const handleExportPDF = () => {
    if (feedbacks.length === 0) return alert('No data to export')

    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Feedback Report', 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

    const tableColumn = ["Message", "User", "Type", "Rating", "Date"]
    const tableRows = feedbacks.map(f => [
      f.message,
      f.userId?.name || 'Anonymous',
      f.type,
      f.rating,
      new Date(f.createdAt).toLocaleDateString()
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 138] }, // dark-blue
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 80 },
      }
    })

    doc.save(`feedback_report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const COLORS = ['#1e3a8a', '#FF8C00', '#10b981', '#f59e0b']

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

        {/* Advanced Filters + Export Section */}
        <div className="glass-effect p-6 rounded-xl mb-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Filter size={20} /> Filters & Search
            </h3>
            
            {/* Export Buttons - Admin Only */}
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-4 py-2 rounded-lg border border-blue-500/30 transition text-sm font-medium"
                >
                  <Download size={16} /> Export CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 px-4 py-2 rounded-lg border border-red-500/30 transition text-sm font-medium"
                >
                  <Download size={16} /> Export PDF
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Keyword Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-accent"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-accent text-white"
              >
                <option value="all" className="bg-primary">All Types</option>
                <option value="Bug" className="bg-primary">Bug</option>
                <option value="Feature Request" className="bg-primary">Feature Request</option>
                <option value="UX" className="bg-primary">UX/Design</option>
                <option value="Other" className="bg-primary">Other</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-accent text-white"
              >
                <option value="all" className="bg-primary">All Ratings</option>
                <option value="5" className="bg-primary">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4" className="bg-primary">⭐⭐⭐⭐ (4)</option>
                <option value="3" className="bg-primary">⭐⭐⭐ (3)</option>
                <option value="2" className="bg-primary">⭐⭐ (2)</option>
                <option value="1" className="bg-primary">⭐ (1)</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-accent text-white"
              >
                <option value="newest" className="bg-primary">Newest First</option>
                <option value="oldest" className="bg-primary">Oldest First</option>
                <option value="highest_rating" className="bg-primary">Highest Rating</option>
                <option value="lowest_rating" className="bg-primary">Lowest Rating</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
            {/* Date Range */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-accent text-white text-sm"
                  title="From Date"
                />
              </div>
              <span className="text-gray-500">to</span>
              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-accent text-white text-sm"
                  title="To Date"
                />
              </div>
              {(fromDate || toDate || searchKeyword !== '' || filterType !== 'all' || ratingFilter !== 'all') && (
                <button
                  onClick={() => {
                    setFromDate('')
                    setToDate('')
                    setSearchKeyword('')
                    setFilterType('all')
                    setRatingFilter('all')
                    setSortOption('newest')
                  }}
                  className="text-xs text-accent hover:underline px-2"
                >
                  Reset All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feedbacks List */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feedback Items */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Feedback ({totalFeedbacks})</h3>
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              {feedbacks.length > 0 ? (
                feedbacks.map(feedback => (
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
                          <p className="text-sm text-gray-400">{feedback.userId?.name || 'Anonymous'} • {feedback.type} • {new Date(feedback.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-xl">{'⭐'.repeat(feedback.rating)}</div>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          feedback.type === 'Bug' ? 'bg-red-500/20 text-red-300' :
                          feedback.type === 'Feature Request' ? 'bg-blue-500/20 text-blue-300' :
                          feedback.type === 'UX' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-white/10 text-gray-300'
                        }`}>
                          {feedback.type}
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
                <div className="text-center py-12 glass-effect rounded-xl text-gray-400">
                  <p>No feedback matching filters</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Previous Page"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg transition ${
                        currentPage === i + 1 
                          ? 'bg-accent text-white font-bold' 
                          : 'bg-white/5 hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Next Page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Feedback Details */}
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
