/**
 * Question Controller
 * Handles question CRUD and upvoting
 */
const Question = require('../models/Question')

// Get all questions
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ isDeleted: false })
      .populate('userId', 'name email')
      .populate('answers.userId', 'name email')
      .sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching questions',
      error: error.message 
    })
  }
}

// Create question
exports.createQuestion = async (req, res) => {
  try {
    const { title, description } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a title' 
      })
    }

    // Check if title contains at least one letter
    if (!/[a-zA-Z]/.test(title)) {
      return res.status(400).json({ 
        success: false,
        message: 'Title must contain at least one letter' 
      })
    }

    if (title.trim().length < 5) {
      return res.status(400).json({ 
        success: false,
        message: 'Title must be at least 5 characters' 
      })
    }

    if (title.trim().length > 150) {
      return res.status(400).json({ 
        success: false,
        message: 'Title must not exceed 150 characters' 
      })
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a description' 
      })
    }

    // Check if description contains at least one letter
    if (!/[a-zA-Z]/.test(description)) {
      return res.status(400).json({ 
        success: false,
        message: 'Description must contain at least one letter' 
      })
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ 
        success: false,
        message: 'Description must be at least 10 characters' 
      })
    }

    if (description.trim().length > 1000) {
      return res.status(400).json({ 
        success: false,
        message: 'Description must not exceed 1000 characters' 
      })
    }

    const question = await Question.create({
      title: title.trim(),
      description: description.trim(),
      userId: req.user._id
    })

    await question.populate('userId', 'name email')

    res.status(201).json({
      success: true,
      data: question
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating question',
      error: error.message 
    })
  }
}

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, isPinned, status } = req.body

    const question = await Question.findById(id)
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      })
    }

    // Check if user owns the question or is admin
    if (question.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to edit this question' 
      })
    }
    
    // Only admin can pin/unpin or change status
    if ((isPinned !== undefined || status !== undefined) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can pin questions or change status' 
      })
    }

    // Validate title if provided
    if (title) {
      if (!title.trim()) {
        return res.status(400).json({ 
          success: false,
          message: 'Title cannot be empty' 
        })
      }

      if (!/[a-zA-Z]/.test(title)) {
        return res.status(400).json({ 
          success: false,
          message: 'Title must contain at least one letter' 
        })
      }

      if (title.trim().length < 5) {
        return res.status(400).json({ 
          success: false,
          message: 'Title must be at least 5 characters' 
        })
      }

      if (title.trim().length > 150) {
        return res.status(400).json({ 
          success: false,
          message: 'Title must not exceed 150 characters' 
        })
      }
    }

    // Validate description if provided
    if (description) {
      if (!description.trim()) {
        return res.status(400).json({ 
          success: false,
          message: 'Description cannot be empty' 
        })
      }

      if (!/[a-zA-Z]/.test(description)) {
        return res.status(400).json({ 
          success: false,
          message: 'Description must contain at least one letter' 
        })
      }

      if (description.trim().length < 10) {
        return res.status(400).json({ 
          success: false,
          message: 'Description must be at least 10 characters' 
        })
      }

      if (description.trim().length > 1000) {
        return res.status(400).json({ 
          success: false,
          message: 'Description must not exceed 1000 characters' 
        })
      }
    }

    // Update fields
    if (title) question.title = title.trim()
    if (description) question.description = description.trim()
    if (isPinned !== undefined) question.isPinned = isPinned
    if (status) question.status = status

    await question.save()
    await question.populate('userId', 'name email')

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating question',
      error: error.message 
    })
  }
}

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params

    const question = await Question.findById(id)
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      })
    }

    // Check if user owns the question or is admin
    if (question.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this question' 
      })
    }

    // Soft delete - mark as deleted instead of removing from database
    await Question.findByIdAndUpdate(id, { isDeleted: true })
    res.status(200).json({ 
      success: true,
      message: 'Question deleted successfully' 
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting question',
      error: error.message 
    })
  }
}

// Upvote question
exports.upvoteQuestion = async (req, res) => {
  try {
    const { id } = req.params

    const question = await Question.findById(id)
    if (!question || question.isDeleted) {
      return res.status(404).json({ message: 'Question not found' })
    }

    const userIndex = question.upvoters.findIndex(upvoter => upvoter.toString() === req.user._id.toString())

    if (userIndex > -1) {
      // Remove upvote
      question.upvoters.splice(userIndex, 1)
      question.upvotes = Math.max(0, question.upvotes - 1)
    } else {
      // Add upvote
      question.upvoters.push(req.user._id)
      question.upvotes += 1
    }

    await question.save()
    res.json(question)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Post answer to question
exports.postAnswer = async (req, res) => {
  try {
    const { id } = req.params
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Answer text is required' 
      })
    }

    const question = await Question.findById(id)
    if (!question || question.isDeleted) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      })
    }

    // Check if user is the owner of the question
    if (question.userId.toString() === req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'You cannot answer your own question' 
      })
    }

    const answer = {
      text: text.trim(),
      userId: req.user._id
    }

    question.answers.push(answer)
    await question.save()
    
    const updatedQuestion = await Question.findById(id)
      .populate('userId', 'name email')
      .populate('answers.userId', 'name email')

    res.status(201).json({
      success: true,
      message: 'Answer posted successfully',
      data: updatedQuestion
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error posting answer',
      error: error.message 
    })
  }
}

// Delete answer from question
exports.deleteAnswer = async (req, res) => {
  try {
    const { id, answerId } = req.params

    const question = await Question.findById(id)
    if (!question || question.isDeleted) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      })
    }

    const answerIndex = question.answers.findIndex(ans => ans._id.toString() === answerId)
    if (answerIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Answer not found' 
      })
    }

    const answer = question.answers[answerIndex]
    
    // Check if user is the answer author or admin
    if (answer.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this answer' 
      })
    }

    question.answers.splice(answerIndex, 1)
    await question.save()

    const updatedQuestion = await Question.findById(id)
      .populate('userId', 'name email')
      .populate('answers.userId', 'name email')

    res.json({
      success: true,
      message: 'Answer deleted successfully',
      data: updatedQuestion
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting answer',
      error: error.message 
    })
  }
}
