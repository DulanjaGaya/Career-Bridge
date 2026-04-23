import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CheckCircle, Trash2, Pin, PinOff, Edit2, MessageSquare, TrendingUp, AlertCircle, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { validateOfficialAnswerSubmission, validateQAForm, getCleanInput } from '../utils/validations'
import api from '../api/axios'

/**
 * Enhanced QAPage with Admin Features
 * - Users: Ask questions, view answers
 * - Admin: Provide official answers, manage questions, analytics
 */
const EnhancedQAPage = () => {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [adminReply, setAdminReply] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [showNewQuestion, setShowNewQuestion] = useState(false)
  const [newQuestion, setNewQuestion] = useState({ title: '', description: '' })
  const [adminReplyError, setAdminReplyError] = useState('')
  const [userAnswerError, setUserAnswerError] = useState('')
  const [newQuestionErrors, setNewQuestionErrors] = useState({})
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [editFormData, setEditFormData] = useState({ title: '', description: '' })

  useEffect(() => {
    fetchQuestions()
  }, [])

  const handleAuthFailure = (error) => {
    const msg = error?.message || ''
    if (/invalid token|not authorized|no authorization/i.test(msg)) {
      logout()
      setMessage({ type: 'error', text: 'Session expired. Please log in again.' })
      navigate('/login')
      return true
    }
    return false
  }

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/questions')
      setQuestions(data.data || [])
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      return (
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }).sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [searchTerm, questions])

  const statsData = [
    { name: 'Total', value: questions.length },
    { name: 'Answered', value: questions.filter(q => q.answers?.length > 0).length }
  ]

  const handlePostQuestion = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'Session expired or not logged in. Please log in again.' })
      return
    }

    const validation = validateQAForm(newQuestion.title, newQuestion.description)
    if (!validation.valid) {
      setNewQuestionErrors(validation.errors)
      setMessage({ type: 'error', text: 'Please fill all the fields in the form' })
      return
    }

    try {
      await api.post('/questions', {
        title: getCleanInput(newQuestion.title),
        description: getCleanInput(newQuestion.description)
      })

      setMessage({ type: 'success', text: 'Question posted successfully!' })
      setNewQuestion({ title: '', description: '' })
      setNewQuestionErrors({})
      setShowNewQuestion(false)
      await fetchQuestions()
    } catch (error) {
      const msg = error.response?.data?.message || error.message
      if (!handleAuthFailure({ message: msg })) {
        setMessage({ type: 'error', text: msg })
      }
    }
  }

  const handlePostOfficialAnswer = async (questionId) => {
    const validation = validateOfficialAnswerSubmission(adminReply)
    if (!validation.valid) {
      setAdminReplyError(validation.errors.answer)
      setMessage({ type: 'error', text: 'Please fix the answer below' })
      return
    }

    if (!token) {
      setMessage({ type: 'error', text: 'Session expired or not logged in. Please log in again.' })
      return
    }

    try {
      const { data } = await api.post(`/questions/${questionId}/answers`, {
        text: getCleanInput(adminReply)
      })

      setMessage({ type: 'success', text: 'Official answer posted successfully!' })
      setAdminReply('')
      setAdminReplyError('')

      if (selectedQuestion && selectedQuestion._id === questionId && data.data) {
        setSelectedQuestion(data.data)
      }

      fetchQuestions()
    } catch (error) {
      const msg = error.response?.data?.message || error.message
      if (!handleAuthFailure({ message: msg })) {
        setMessage({ type: 'error', text: msg })
      }
    }
  }

  const handlePostUserAnswer = async (questionId) => {
    if (!userAnswer.trim()) {
      setUserAnswerError('Please write an answer')
      return
    }
    if (userAnswer.trim().length < 10) {
      setUserAnswerError('Answer must be at least 10 characters')
      return
    }
    if (userAnswer.trim().length > 2000) {
      setUserAnswerError('Answer must not exceed 2000 characters')
      return
    }
    if (!token) {
      setMessage({ type: 'error', text: 'Session expired or not logged in. Please log in again.' })
      return
    }

    try {
      const { data } = await api.post(`/questions/${questionId}/answers`, {
        text: getCleanInput(userAnswer)
      })

      setMessage({ type: 'success', text: 'Answer posted successfully!' })
      setUserAnswer('')
      setUserAnswerError('')

      if (selectedQuestion && selectedQuestion._id === questionId && data.data) {
        setSelectedQuestion(data.data)
      }

      fetchQuestions()
    } catch (error) {
      const msg = error.response?.data?.message || error.message
      if (!handleAuthFailure({ message: msg })) {
        setMessage({ type: 'error', text: msg })
      }
    }
  }

  const handleDeleteAnswer = async (questionId, answerId) => {
    if (!window.confirm('Delete this answer?')) return
    try {
      const { data } = await api.delete(`/questions/${questionId}/answers/${answerId}`)

      setMessage({ type: 'success', text: 'Answer deleted successfully!' })

      if (selectedQuestion && selectedQuestion._id === questionId && data.data) {
        setSelectedQuestion(data.data)
      }

      fetchQuestions()
    } catch (error) {
      const msg = error.response?.data?.message || error.message
      if (!handleAuthFailure({ message: msg })) {
        setMessage({ type: 'error', text: msg })
      }
    }
  }

  const handleTogglePin = async (questionId) => {
    try {
      const currentQuestion = questions.find(q => q._id === questionId)
      await api.patch(`/questions/${questionId}`, {
        isPinned: !currentQuestion.isPinned
      })

      const updated = questions.map(q =>
        q._id === questionId ? { ...q, isPinned: !q.isPinned } : q
      )
      setQuestions(updated)
      setSelectedQuestion(updated.find(q => q._id === questionId))
      setMessage({ type: 'success', text: 'Pin status updated!' })
    } catch (error) {
      const msg = error.response?.data?.message || error.message
      if (!handleAuthFailure({ message: msg })) {
        setMessage({ type: 'error', text: msg })
      }
    }
  }

  const handleMarkStatus = async (questionId, status) => {
    try {
      await api.patch(`/questions/${questionId}`, { status })

      const updated = questions.map(q =>
        q._id === questionId ? { ...q, status } : q
      )
      setQuestions(updated)
      setSelectedQuestion(updated.find(q => q._id === questionId))
      setMessage({ type: 'success', text: 'Status updated!' })
    } catch (error) {
      const msg = error.response?.data?.message || error.message
      if (!handleAuthFailure({ message: msg })) {
        setMessage({ type: 'error', text: msg })
      }
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return
    try {
      await api.delete(`/questions/${questionId}`)

      setMessage({ type: 'success', text: 'Question deleted successfully!' })
      setSelectedQuestion(null)
      fetchQuestions()
    } catch (error) {
      const msg = error.response?.data?.message || error.message
      if (!handleAuthFailure({ message: msg })) {
        setMessage({ type: 'error', text: msg })
      }
    }
  }

  const handleDeleteInappropriate = async (questionId) => {
    if (!window.confirm('Delete inappropriate content?')) return
    try {
      await api.delete(`/questions/${questionId}`)

      setMessage({ type: 'success', text: 'Inappropriate question deleted!' })
      setQuestions(questions.filter(q => q._id !== questionId))
      setSelectedQuestion(null)
    } catch (error) {
      const msg = error.response?.data?.message || error.message
      if (!handleAuthFailure({ message: msg })) {
        setMessage({ type: 'error', text: msg })
      }
    }
  }

  const handleEditQuestion = (question) => {
    setEditingQuestion(question._id)
    setEditFormData({ title: question.title, description: question.description })
  }

  const handleSaveEditQuestion = async (questionId) => {
    const validation = validateQAForm(editFormData.title, editFormData.description)
    if (!validation.valid) {
      setNewQuestionErrors(validation.errors)
      return
    }

    try {
      const { data } = await api.patch(`/questions/${questionId}`, {
        title: getCleanInput(editFormData.title),
        description: getCleanInput(editFormData.description)
      })

      setMessage({ type: 'success', text: 'Question updated successfully!' })
      setEditingQuestion(null)
      setNewQuestionErrors({})
      fetchQuestions()
      setSelectedQuestion(null)
    } catch (error) {
      const msg = error.response?.data?.message || error.message
      if (!handleAuthFailure({ message: msg })) {
        setMessage({ type: 'error', text: msg })
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingQuestion(null)
    setNewQuestionErrors({})
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-blue">
      <Navbar />

      <div className="flex-1 px-6 py-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Q&A Community</h1>
          <p className="text-xl text-gray-300">Ask questions, get expert answers</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`flex items-center gap-3 p-4 rounded-lg mb-8 ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-300 border border-green-500/50'
              : 'bg-red-500/20 text-red-300 border border-red-500/50'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Admin Analytics */}
        {user?.role === 'admin' && (
          <div className="glass-effect p-6 rounded-xl mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-accent" /> Question Statistics
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: '#1e3a8a', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#FF8C00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Post Question Button */}
        {!showNewQuestion && user && (
          <button
            onClick={() => setShowNewQuestion(true)}
            className="mb-8 bg-accent hover:bg-opacity-90 px-6 py-3 rounded-lg font-medium transition"
          >
            Ask a Question
          </button>
        )}

        {/* Post Question Form */}
        {showNewQuestion && (
          <div className="glass-effect p-6 rounded-xl mb-8">
            <h3 className="text-xl font-bold mb-4">Ask a Question</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => {
                    setNewQuestion({ ...newQuestion, title: e.target.value })
                    if (newQuestionErrors.title) {
                      setNewQuestionErrors(prev => ({ ...prev, title: null }))
                    }
                  }}
                  placeholder="Question title..."
                  className={`w-full bg-white/10 border rounded-lg px-4 py-2 outline-none focus:border-accent transition ${
                    newQuestionErrors.title ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {newQuestionErrors.title && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle size={14} /> {newQuestionErrors.title}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{newQuestion.title.length}/150 characters</p>
              </div>
              <div>
                <textarea
                  value={newQuestion.description}
                  onChange={(e) => {
                    setNewQuestion({ ...newQuestion, description: e.target.value })
                    if (newQuestionErrors.description) {
                      setNewQuestionErrors(prev => ({ ...prev, description: null }))
                    }
                  }}
                  placeholder="Provide more details..."
                  rows="4"
                  className={`w-full bg-white/10 border rounded-lg px-4 py-2 outline-none focus:border-accent resize-none transition ${
                    newQuestionErrors.description ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {newQuestionErrors.description && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle size={14} /> {newQuestionErrors.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{newQuestion.description.length}/1000 characters</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNewQuestion(false)
                    setNewQuestionErrors({})
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostQuestion}
                  className="flex-1 bg-accent hover:bg-opacity-90 px-4 py-2 rounded-lg font-medium transition"
                >
                  Post Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-lg px-4 py-3">
            <Search size={20} className="text-accent" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent flex-1 outline-none"
            />
          </div>
        </div>

        {/* Q&A Layout */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Questions List */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Questions ({filteredQuestions.length})</h3>

            {loading ? (
              <p className="text-gray-400">Loading questions...</p>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map(question => {
                    const isOwner = question.userId?._id === user?._id || question.userId === user?._id

                    return (
                      <div key={question._id} className="space-y-2">
                        {editingQuestion === question._id ? (
                          <div className="glass-effect p-4 rounded-lg space-y-3">
                            <input
                              type="text"
                              value={editFormData.title}
                              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                              placeholder="Question title..."
                              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 outline-none focus:border-accent"
                            />
                            {newQuestionErrors.title && <p className="text-red-400 text-xs">{newQuestionErrors.title}</p>}

                            <textarea
                              value={editFormData.description}
                              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                              placeholder="Question description..."
                              rows="3"
                              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 outline-none focus:border-accent resize-none"
                            />
                            {newQuestionErrors.description && <p className="text-red-400 text-xs">{newQuestionErrors.description}</p>}

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEditQuestion(question._id)}
                                className="flex-1 bg-accent hover:bg-opacity-90 px-3 py-2 rounded text-sm font-medium transition"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex-1 bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-sm transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedQuestion(question)}
                            className={`w-full text-left glass-effect p-4 rounded-lg hover:bg-white/10 transition group ${
                              selectedQuestion?._id === question._id ? 'bg-white/10 border-l-4 border-accent' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {question.isPinned && <Pin size={16} className="text-accent" />}
                                  <h4 className="font-semibold group-hover:text-accent transition">{question.title}</h4>
                                </div>
                                <p className="text-sm text-gray-400">{question.userId?.name || 'Anonymous'} • {question.userId?.role || 'User'}</p>
                              </div>
                              <span className={`px-3 py-1 rounded text-xs font-medium ${
                                question.status === 'Open' ? 'bg-blue-500/20 text-blue-400' :
                                question.status === 'Answered' ? 'bg-green-500/20 text-green-400' :
                                'bg-purple-500/20 text-purple-400'
                              }`}>
                                {question.status || 'Open'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 line-clamp-2 mb-2">{question.description}</p>
                            <div className="flex gap-4 text-sm text-gray-400">
                              <span>👆 {question.upvotes || 0}</span>
                              <span>💬 {question.answers?.length || 0}</span>
                            </div>
                          </button>
                        )}

                        {isOwner && editingQuestion !== question._id && (
                          <div className="flex gap-2 px-1">
                            <button
                              onClick={() => handleEditQuestion(question)}
                              className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded text-sm transition"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question._id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded text-sm transition"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No questions found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Question Details & Answers */}
          {selectedQuestion && (
            <div className="md:col-span-1 glass-effect p-6 rounded-xl h-fit sticky top-24">
              <h3 className="text-lg font-bold mb-4">{selectedQuestion.title}</h3>

              {(() => {
                const isOwner = selectedQuestion.userId?._id === user?._id
                const isAdmin = user?.role === 'admin'

                return (
                  <>
                    {(isOwner || isAdmin) && (
                      <div className="space-y-2 mb-6 pb-6 border-b border-white/20">
                        {isOwner && (
                          <>
                            <button
                              onClick={() => handleEditQuestion(selectedQuestion)}
                              className="w-full flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-2 rounded text-sm transition"
                            >
                              <Edit2 size={16} /> Edit Question
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(selectedQuestion._id)}
                              className="w-full flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded text-sm transition"
                            >
                              <Trash2 size={16} /> Delete Question
                            </button>
                          </>
                        )}

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleTogglePin(selectedQuestion._id)}
                              className="w-full flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-sm transition"
                            >
                              {selectedQuestion.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                              {selectedQuestion.isPinned ? 'Unpin' : 'Pin'} Question
                            </button>

                            <select
                              value={selectedQuestion.status || 'Open'}
                              onChange={(e) => handleMarkStatus(selectedQuestion._id, e.target.value)}
                              className="w-full bg-blue-500 border border-blue-700 rounded px-3 py-2 text-white text-sm"
                            >
                              <option value="Open">Mark as Open</option>
                              <option value="Answered">Mark as Answered</option>
                              <option value="Resolved">Mark as Resolved</option>
                            </select>

                            {!isOwner && (
                              <button
                                onClick={() => handleDeleteInappropriate(selectedQuestion._id)}
                                className="w-full flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded text-sm transition"
                              >
                                <Trash2 size={16} /> Delete Inappropriate
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </>
                )
              })()}

              {/* Answers */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare size={18} /> Answers ({selectedQuestion.answers?.length || 0})
                </h4>

                {selectedQuestion.answers?.map(answer => (
                  <div key={answer._id} className="p-3 rounded bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-accent">{answer.userId?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{new Date(answer.createdAt).toLocaleDateString()}</p>
                      </div>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteAnswer(selectedQuestion._id, answer._id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">{answer.text}</p>
                  </div>
                ))}
              </div>

              {/* User Answer Form */}
              {user && user?.role !== 'admin' && (
                <div className="space-y-2 pt-4 border-t border-white/20">
                  <p className="text-sm font-medium">Post Your Answer</p>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => {
                      setUserAnswer(e.target.value)
                      if (userAnswerError) setUserAnswerError('')
                    }}
                    placeholder="Write your answer (10-2000 characters)..."
                    rows="3"
                    className={`w-full bg-white/10 border rounded px-3 py-2 text-sm outline-none focus:border-accent resize-none transition ${
                      userAnswerError ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {userAnswerError && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle size={14} /> {userAnswerError}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">{userAnswer.length}/2000 characters</p>
                  <button
                    onClick={() => handlePostUserAnswer(selectedQuestion._id)}
                    className="w-full bg-accent hover:bg-opacity-90 px-3 py-2 rounded text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Post Answer
                  </button>
                </div>
              )}

              {/* Admin Reply */}
              {user?.role === 'admin' && (
                <div className="space-y-2 pt-4 border-t border-white/20">
                  <p className="text-sm font-medium">Post Official Answer</p>
                  <textarea
                    value={adminReply}
                    onChange={(e) => {
                      setAdminReply(e.target.value)
                      if (adminReplyError) setAdminReplyError('')
                    }}
                    placeholder="Write official answer (10-2000 characters)..."
                    rows="3"
                    className={`w-full bg-white/10 border rounded px-3 py-2 text-sm outline-none focus:border-accent resize-none transition ${
                      adminReplyError ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {adminReplyError && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle size={14} /> {adminReplyError}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">{adminReply.length}/2000 characters</p>
                  <button
                    onClick={() => handlePostOfficialAnswer(selectedQuestion._id)}
                    className="w-full bg-accent hover:bg-opacity-90 px-3 py-2 rounded text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Post Official Answer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default EnhancedQAPage
