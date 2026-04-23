import React, { useState, useMemo, useEffect } from 'react'
import { Search, ChevronDown, ThumbsUp, Edit2, Trash2, Plus, TrendingUp, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'
import { validateFAQForm, getCleanInput } from '../utils/validations'

/**
 * FAQPage - Advanced FAQ Management with search, filter, upvote, analytics, and admin edit
 */
const FAQPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState(null)
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', category: 'General' })
  const [userUpvotes, setUserUpvotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const API_BASE_URL = 'http://localhost:5001/api'

  // Sample FAQ data fallback
  const [faqs, setFaqs] = useState([])

  // Fetch FAQs on component mount
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/faqs`)
        if (response.data.success) {
          setFaqs(response.data.data)
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err)
        setError('Failed to load FAQs')
        // Use sample data as fallback
        setSampleFAQs()
      } finally {
        setLoading(false)
      }
    }
    
    fetchFAQs()
  }, [])

  const setSampleFAQs = () => {
    setFaqs([
    {
      _id: '1',
      question: 'How do I create an account?',
      answer: 'Click on "Sign Up" on the homepage, fill in your details, choose your role (Student, University, or Employer), and submit. You\'ll receive a confirmation email.',
      category: 'Account',
      upvotes: 24,
      views: 156,
      tags: ['Getting Started', 'Account'],
      createdAt: new Date(2024, 0, 15)
    },
    {
      _id: '2',
      question: 'What roles are available?',
      answer: 'Career Bridge has three main roles: Students looking for internships/jobs, Universities managing programs, and Employers posting opportunities.',
      category: 'Account',
      upvotes: 18,
      views: 142,
      tags: ['Roles', 'Account'],
      createdAt: new Date(2024, 0, 10)
    },
    {
      _id: '3',
      question: 'How can I post a job as an employer?',
      answer: 'Log in as an Employer, navigate to "Post Job", fill in job details, requirements, and salary range. Your posting will be visible to all students.',
      category: 'Employer',
      upvotes: 32,
      views: 189,
      tags: ['Jobs', 'Employer', 'Popular'],
      createdAt: new Date(2024, 0, 5)
    },
    {
      _id: '4',
      question: 'How do I contact support?',
      answer: 'Use the "Contact Us" form on the footer, or submit feedback through the Feedback page. Our team typically responds within 24-48 hours.',
      category: 'Support',
      upvotes: 12,
      views: 89,
      tags: ['Support', 'Contact'],
      createdAt: new Date(2024, 0, 1)
    },
    {
      _id: '5',
      question: 'Is my data secure?',
      answer: 'Yes! We use industry-standard encryption, secure servers, and never share your data with third parties without consent.',
      category: 'Security',
      upvotes: 28,
      views: 134,
      tags: ['Security', 'Privacy'],
      createdAt: new Date(2024, 1, 1)
    },
    {
      _id: '6',
      question: 'Can I update my profile?',
      answer: 'Yes, go to Settings > Profile and update your information anytime. Changes are saved immediately.',
      category: 'Account',
      upvotes: 15,
      views: 101,
      tags: ['Profile', 'Account'],
      createdAt: new Date(2024, 1, 5)
    }
    ])
  }

  const categories = ['all', 'General', 'Account', 'Employer', 'Support', 'Security']
  const allTags = ['Getting Started', 'Account', 'Roles', 'Jobs', 'Employer', 'Popular', 'Support', 'Contact', 'Security', 'Privacy', 'Profile']

  // Filter FAQs
  const filteredFAQs = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase()
    return faqs.filter(faq => {
      const matchesSearch = faq.question?.toLowerCase().includes(lowerSearch) ||
                          faq.answer?.toLowerCase().includes(lowerSearch) ||
                          faq.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
      return matchesSearch && matchesCategory
    }).sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
  }, [searchTerm, selectedCategory, faqs])

  // Analytics data
  const viewsData = faqs.map(faq => ({
    name: faq.question.substring(0, 15) + '...',
    views: faq.views,
    upvotes: faq.upvotes
  }))

  const categoryDistribution = useMemo(() => {
    const dist = categories.slice(1).map(cat => ({
      name: cat,
      value: faqs.filter(f => f.category === cat).length
    }))
    const total = dist.reduce((sum, cat) => sum + cat.value, 0)
    return dist.map(cat => ({
      ...cat,
      percentage: total > 0 ? ((cat.value / total) * 100).toFixed(1) : 0
    }))
  }, [faqs])

  const handleUpvote = (id) => {
    const newUpvotes = { ...userUpvotes }
    if (newUpvotes[id]) {
      newUpvotes[id] = false
      setFaqs(faqs.map(f => f._id === id ? { ...f, upvotes: f.upvotes - 1 } : f))
    } else {
      newUpvotes[id] = true
      setFaqs(faqs.map(f => f._id === id ? { ...f, upvotes: f.upvotes + 1 } : f))
    }
    setUserUpvotes(newUpvotes)
  }

  const handleAddFAQ = async () => {
    const validation = validateFAQForm(newFAQ.question, newFAQ.answer, newFAQ.category)
    
    if (!validation.valid) {
      setFormErrors(validation.errors)
      return
    }

    try {
      const cleanQuestion = getCleanInput(newFAQ.question)
      const cleanAnswer = getCleanInput(newFAQ.answer)
      
      const response = await axios.post(
        `${API_BASE_URL}/faqs`,
        {
          question: cleanQuestion,
          answer: cleanAnswer,
          category: newFAQ.category,
          tags: [newFAQ.category]
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      if (response.data.success) {
        setFaqs([...faqs, response.data.data])
        setNewFAQ({ question: '', answer: '', category: 'General' })
        setFormErrors({})
        setShowAddModal(false)
        setMessage({ type: 'success', text: 'FAQ created successfully!' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Error adding FAQ:', error)
      setMessage({ type: 'error', text: 'Error adding FAQ: ' + (error.response?.data?.message || error.message) })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleEditFAQ = (faq) => {
    setEditingFAQ({ ...faq })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    const validation = validateFAQForm(editingFAQ.question, editingFAQ.answer, editingFAQ.category)
    
    if (!validation.valid) {
      setEditErrors(validation.errors)
      return
    }

    try {
      const cleanQuestion = getCleanInput(editingFAQ.question)
      const cleanAnswer = getCleanInput(editingFAQ.answer)
      
      const response = await axios.patch(
        `${API_BASE_URL}/faqs/${editingFAQ._id}`,
        {
          question: cleanQuestion,
          answer: cleanAnswer,
          category: editingFAQ.category,
          tags: [editingFAQ.category]
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      if (response.data.success) {
        const updated = faqs.map(f => 
          f._id === editingFAQ._id ? response.data.data : f
        )
        setFaqs(updated)
        setShowEditModal(false)
        setEditingFAQ(null)
        setExpandedId(null)
        setEditErrors({})
        setMessage({ type: 'success', text: 'FAQ updated successfully!' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Error saving FAQ:', error)
      setMessage({ type: 'error', text: 'Error saving FAQ: ' + (error.response?.data?.message || error.message) })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleDeleteFAQ = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/faqs/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
        if (response.data.success) {
          setFaqs(faqs.filter(f => f._id !== id))
          setMessage({ type: 'success', text: 'FAQ deleted successfully!' })
          setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        }
      } catch (error) {
        console.error('Error deleting FAQ:', error)
        setMessage({ type: 'error', text: 'Error deleting FAQ: ' + (error.response?.data?.message || error.message) })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    }
  }

  const COLORS = ['#1e3a8a', '#FF8C00', '#3b82f6', '#10b981', '#f59e0b']

  return (
    <div className="min-h-screen flex flex-col bg-dark-blue">
      <Navbar />

      <div className="flex-1 px-6 py-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-300 mb-8">Find answers to common questions about Career Bridge</p>

          {/* Add FAQ Button (Admin Only) */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-accent hover:bg-opacity-90 px-6 py-3 rounded-lg font-medium transition"
            >
              <Plus size={20} /> Add FAQ
            </button>
          )}
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`flex items-center gap-3 p-4 rounded-lg mb-8 ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-300 border border-green-500/50'
              : 'bg-red-500/20 text-red-300 border border-red-500/50'
          }`}>
            {message.type === 'success' ? 
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              : <AlertCircle size={20} />
            }
            <span>{message.text}</span>
          </div>
        )}

        {/* Search & Filter */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-lg px-4 py-3">
              <Search size={20} className="text-accent" />
              <input
                type="text"
                placeholder="Search FAQs by keyword or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent flex-1 outline-none"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-accent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-primary">
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Analytics Section - Admin Only */}
        {user?.role === 'admin' && (
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Category Distribution with Percentages */}
          <div className="glass-effect p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-6">FAQs by Category</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {categoryDistribution.map((cat, index) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">{cat.name}</p>
                    <p className="text-xs text-gray-400">{cat.value} items • {cat.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e3a8a', border: '1px solid rgba(255, 140, 0, 0.5)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value, name, props) => [`${value} items (${props.payload.percentage}%)`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* FAQs List */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map(faq => (
              <div key={faq._id} className="glass-effect rounded-xl overflow-hidden">
                {/* Header */}
                <div className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition group">
                  <button
                    onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
                    className="flex-1 text-left"
                  >
                    <h3 className="text-lg font-bold group-hover:text-accent transition">{faq.question}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span>👁️ {faq.views ?? 0} views</span>
                      <span>📊 {faq.upvotes ?? 0} upvotes</span>
                      <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">{faq.category ?? 'General'}</span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleEditFAQ(faq)}
                          className="p-2 rounded-lg text-accent hover:bg-blue-500/20 transition"
                          title="Edit FAQ"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteFAQ(faq._id)}
                          className="p-2 rounded-lg text-accent hover:bg-red-500/20 transition"
                          title="Delete FAQ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
                      className="p-2 rounded-lg text-accent hover:bg-white/10 transition"
                      aria-label="Toggle FAQ details"
                    >
                      <ChevronDown
                        size={24}
                        className={`transition-transform ${expandedId === faq._id ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === faq._id && (
                  <div className="px-6 py-4 bg-white/5 border-t border-white/20">
                    <p className="text-gray-300 mb-4 leading-relaxed">{faq.answer}</p>

                    {/* Tags */}
                    {faq.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {faq.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-start gap-4 pt-4 border-t border-white/20">
                      <button
                        onClick={() => handleUpvote(faq._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                          userUpvotes[faq._id]
                            ? 'bg-accent/30 text-accent'
                            : 'bg-white/10 hover:bg-white/20 text-gray-300'
                        }`}
                      >
                        <ThumbsUp size={18} />
                        Helpful ({faq.upvotes})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No FAQs found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add FAQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="glass-effect rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Add New FAQ</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <input
                  type="text"
                  value={newFAQ.question}
                  onChange={(e) => {
                    setNewFAQ({ ...newFAQ, question: e.target.value })
                    if (formErrors.question) setFormErrors({ ...formErrors, question: null })
                  }}
                  placeholder="Enter FAQ question..."
                  className={`w-full bg-white/10 border ${formErrors.question ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2 outline-none focus:border-accent`}
                />
                {formErrors.question && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {formErrors.question}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{newFAQ.question.length}/150 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Answer</label>
                <textarea
                  value={newFAQ.answer}
                  onChange={(e) => {
                    setNewFAQ({ ...newFAQ, answer: e.target.value })
                    if (formErrors.answer) setFormErrors({ ...formErrors, answer: null })
                  }}
                  placeholder="Enter FAQ answer..."
                  rows="4"
                  className={`w-full bg-white/10 border ${formErrors.answer ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2 outline-none focus:border-accent resize-none`}
                />
                {formErrors.answer && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {formErrors.answer}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{newFAQ.answer.length}/2000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newFAQ.category}
                  onChange={(e) => {
                    setNewFAQ({ ...newFAQ, category: e.target.value })
                    if (formErrors.category) setFormErrors({ ...formErrors, category: null })
                  }}
                  className={`w-full bg-white/10 border ${formErrors.category ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2 outline-none focus:border-accent`}
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat} className="bg-primary">
                      {cat}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {formErrors.category}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setFormErrors({})
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFAQ}
                  className="flex-1 bg-accent hover:bg-opacity-90 px-4 py-2 rounded-lg font-medium transition"
                >
                  Add FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {showEditModal && editingFAQ && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="glass-effect rounded-xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit FAQ</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingFAQ(null)
                  setEditErrors({})
                }}
                className="hover:bg-white/10 p-2 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <input
                  type="text"
                  value={editingFAQ.question}
                  onChange={(e) => {
                    setEditingFAQ({ ...editingFAQ, question: e.target.value })
                    if (editErrors.question) setEditErrors({ ...editErrors, question: null })
                  }}
                  placeholder="Enter FAQ question..."
                  className={`w-full bg-white/10 border ${editErrors.question ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2 outline-none focus:border-accent`}
                />
                {editErrors.question && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {editErrors.question}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{editingFAQ.question.length}/150 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Answer</label>
                <textarea
                  value={editingFAQ.answer}
                  onChange={(e) => {
                    setEditingFAQ({ ...editingFAQ, answer: e.target.value })
                    if (editErrors.answer) setEditErrors({ ...editErrors, answer: null })
                  }}
                  placeholder="Enter FAQ answer..."
                  rows="4"
                  className={`w-full bg-white/10 border ${editErrors.answer ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2 outline-none focus:border-accent resize-none`}
                />
                {editErrors.answer && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {editErrors.answer}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{editingFAQ.answer.length}/2000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={editingFAQ.category}
                  onChange={(e) => {
                    setEditingFAQ({ ...editingFAQ, category: e.target.value })
                    if (editErrors.category) setEditErrors({ ...editErrors, category: null })
                  }}
                  className={`w-full bg-white/10 border ${editErrors.category ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2 outline-none focus:border-accent`}
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat} className="bg-primary">
                      {cat}
                    </option>
                  ))}
                </select>
                {editErrors.category && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {editErrors.category}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingFAQ(null)
                    setEditErrors({})
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-accent hover:bg-opacity-90 px-4 py-2 rounded-lg font-medium transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default FAQPage
