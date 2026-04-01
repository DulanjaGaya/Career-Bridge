import React, { useState, useEffect } from 'react'
import { MessageSquare, ThumbsUp, Trash2, Edit2, CheckCircle, AlertCircle, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { validateQAForm, validateQAAnswerSubmission, getCleanInput } from '../utils/validations'

/**
 * QAPage - Q&A Management Page
 * Users can post questions, answer, and upvote
 * Admins can delete inappropriate content
 */
const QAPage = () => {
  const { user, token } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [answerData, setAnswerData] = useState({})
  const [answerErrors, setAnswerErrors] = useState({})
  const [expandedAnswerId, setExpandedAnswerId] = useState(null)

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/questions')
      const data = await response.json()
      setQuestions(data.data || [])
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      setQuestions([])
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
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const handleSubmitQuestion = async (e) => {
    e.preventDefault()

    // Log token for debugging
    console.log('Submitting question with token:', token)
    
    // Validate form using validation utilities
    const validation = validateQAForm(formData.title, formData.description)
    
    if (!validation.valid) {
      setFormErrors(validation.errors)
      setMessage({ type: 'error', text: 'Please fill all the fields' })
      return
    }

    try {
      const cleanTitle = getCleanInput(formData.title)
      const cleanDescription = getCleanInput(formData.description)

      const response = await fetch('http://localhost:5000/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: cleanTitle,
          description: cleanDescription
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create question')
      }

      setMessage({ type: 'success', text: 'Question posted successfully!' })
      setFormData({ title: '', description: '' })
      setFormErrors({})
      setShowForm(false)
      fetchQuestions()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return

    try {
      const response = await fetch(`http://localhost:5000/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete question')
      }

      setMessage({ type: 'success', text: 'Question deleted!' })
      fetchQuestions()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleUpvote = async (questionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/questions/${questionId}/upvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upvote')
      }

      fetchQuestions()
    } catch (error) {
      console.error('Upvote failed:', error)
    }
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswerData(prev => ({
      ...prev,
      [questionId]: value
    }))
    // Clear error when user starts typing
    if (answerErrors[questionId]) {
      setAnswerErrors(prev => ({
        ...prev,
        [questionId]: null
      }))
    }
  }

  const handleSubmitAnswer = async (e, questionId) => {
    e.preventDefault()

    const answerText = answerData[questionId] || ''
    
    // Validate answer using validation utility
    const validation = validateQAAnswerSubmission(answerText)
    
    if (!validation.valid) {
      setAnswerErrors(prev => ({
        ...prev,
        [questionId]: validation.errors.answer
      }))
      setMessage({ type: 'error', text: 'Please fix the answer below' })
      return
    }

    try {
      const cleanAnswer = getCleanInput(answerText)

      const response = await fetch(`http://localhost:5000/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: cleanAnswer
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit answer')
      }

      setMessage({ type: 'success', text: 'Answer posted successfully!' })
      setAnswerData(prev => ({
        ...prev,
        [questionId]: ''
      }))
      setAnswerErrors(prev => ({
        ...prev,
        [questionId]: null
      }))
      setExpandedAnswerId(null)
      fetchQuestions()
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
            <h1 className="text-4xl font-bold mb-4">Q&A Community</h1>
            <p className="text-gray-300 mb-6">Ask questions, share knowledge, and help each other grow.</p>

            {!user && (
              <div className="glass-effect p-4 rounded-lg text-yellow-300 mb-6">
                <p>Please sign in to ask questions or answer others.</p>
              </div>
            )}

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
          </div>

          {/* Post Question Button */}
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-accent text-dark-blue font-bold px-6 py-2 rounded-lg hover:bg-orange-500 transition mb-8"
            >
              {showForm ? 'Cancel' : 'Ask a Question'}
            </button>
          )}

          {/* Question Form */}
          {showForm && (
            <form onSubmit={handleSubmitQuestion} className="glass-effect p-6 rounded-lg mb-8 space-y-4">
              <div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="What's your question?"
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white outline-none focus:border-accent transition ${
                    formErrors.title ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {formErrors.title && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle size={14} /> {formErrors.title}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{formData.title.length}/150 characters</p>
              </div>
              
              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide more details..."
                  rows="5"
                  className={`w-full bg-white/10 border rounded-lg px-4 py-3 text-white outline-none focus:border-accent resize-none transition ${
                    formErrors.description ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {formErrors.description && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle size={14} /> {formErrors.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{formData.description.length}/1000 characters</p>
              </div>
              
              <button
                type="submit"
                className="bg-accent text-dark-blue font-bold px-6 py-2 rounded-lg hover:bg-orange-500 transition"
              >
                Post Question
              </button>
            </form>
          )}

          {/* Questions List */}
          {loading ? (
            <div className="text-center text-gray-400">Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="glass-effect p-8 rounded-lg text-center text-gray-300">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-500" />
              <p>No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map(question => (
                <div key={question._id} className="glass-effect p-6 rounded-lg space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{question.title}</h3>
                      <p className="text-gray-300 mb-4">{question.description}</p>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>By {question.userId?.name || 'Anonymous'}</span>
                        <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {(user?.role === 'admin' || user?._id === question.userId?._id) && (
                      <button
                        onClick={() => handleDeleteQuestion(question._id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  {/* Upvote Button */}
                  {user && (
                    <button
                      onClick={() => handleUpvote(question._id)}
                      className="flex items-center gap-2 text-accent hover:text-orange-500 transition"
                    >
                      <ThumbsUp size={18} />
                      <span>{question.upvotes || 0} Upvotes</span>
                    </button>
                  )}

                  {/* Answers Count */}
                  {question.answers && question.answers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-300 mb-3 font-medium">{question.answers.length} Answer(s)</p>
                      <div className="space-y-3">
                        {question.answers.slice(0, 2).map((answer, idx) => (
                          <div key={idx} className="bg-white/5 p-3 rounded text-sm text-gray-300">
                            <p>{answer.text}</p>
                            <p className="text-xs text-gray-500 mt-2">By {answer.userId?.name || 'Anonymous'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Answer Form */}
                  {user && question.userId?._id !== user._id ? (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      {expandedAnswerId === question._id ? (
                        <form onSubmit={(e) => handleSubmitAnswer(e, question._id)} className="space-y-3">
                          <textarea
                            value={answerData[question._id] || ''}
                            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                            placeholder="Share your answer..."
                            rows="3"
                            className={`w-full bg-white/10 border rounded-lg px-4 py-2 text-white outline-none focus:border-accent resize-none transition ${
                              answerErrors[question._id] ? 'border-red-500' : 'border-white/20'
                            }`}
                          />
                          {answerErrors[question._id] && (
                            <p className="text-red-400 text-xs flex items-center gap-1">
                              <AlertCircle size={14} /> {answerErrors[question._id]}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">{(answerData[question._id] || '').length}/1000 characters</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedAnswerId(null)}
                              className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 bg-accent hover:bg-opacity-90 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                            >
                              <Send size={16} /> Post Answer
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setExpandedAnswerId(question._id)}
                          className="text-accent hover:text-orange-500 text-sm font-medium transition flex items-center gap-2"
                        >
                          <MessageSquare size={16} /> Write an Answer
                        </button>
                      )}
                    </div>
                  ) : question.userId?._id === user?._id ? (
                    <div className="mt-4 pt-4 border-t border-white/10 text-sm text-gray-400">
                      <p className="flex items-center gap-2">
                        <AlertCircle size={16} /> You cannot answer your own question
                      </p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default QAPage
