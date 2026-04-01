const FAQ = require('../models/FAQ')

// GET all FAQs
exports.getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message
    })
  }
}

// GET single FAQ
exports.getFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id)
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      })
    }
    res.status(200).json({
      success: true,
      data: faq
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQ',
      error: error.message
    })
  }
}

// CREATE FAQ (admin only)
exports.createFAQ = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create FAQs'
      })
    }

    const { question, answer, category, tags } = req.body

    // Validate inputs
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide question and answer'
      })
    }

    // Check if question contains at least one letter
    if (!/[a-zA-Z]/.test(question)) {
      return res.status(400).json({
        success: false,
        message: 'Question must contain at least one letter'
      })
    }

    // Check if answer contains at least one letter
    if (!/[a-zA-Z]/.test(answer)) {
      return res.status(400).json({
        success: false,
        message: 'Answer must contain at least one letter'
      })
    }

    // Validate question length
    if (question.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Question must be at least 5 characters'
      })
    }

    if (question.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Question must not exceed 150 characters'
      })
    }

    // Validate answer length
    if (answer.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Answer must be at least 10 characters'
      })
    }

    if (answer.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Answer must not exceed 2000 characters'
      })
    }

    // Validate category
    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      })
    }

    // Check for duplicate questions
    const existingFAQ = await FAQ.findOne({ 
      question: { $regex: `^${question.trim()}$`, $options: 'i' } 
    })
    
    if (existingFAQ) {
      return res.status(400).json({
        success: false,
        message: 'This question already exists'
      })
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim(),
      tags: tags || [category.trim()],
      upvotes: 0,
      views: 0
    })

    res.status(201).json({
      success: true,
      data: faq
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating FAQ',
      error: error.message
    })
  }
}

// UPDATE FAQ (admin only)
exports.updateFAQ = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update FAQs'
      })
    }

    let faq = await FAQ.findById(req.params.id)

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      })
    }

    const { question, answer, category, tags } = req.body

    // Validate inputs if provided
    if (question && question.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Question must be at least 5 characters'
      })
    }

    if (question && question.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Question must not exceed 150 characters'
      })
    }

    if (answer && answer.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Answer must be at least 10 characters'
      })
    }

    if (answer && answer.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Answer must not exceed 2000 characters'
      })
    }

    // Check for duplicate if question changed
    if (question && question.trim() !== faq.question) {
      const duplicate = await FAQ.findOne({ 
        _id: { $ne: req.params.id },
        question: { $regex: `^${question.trim()}$`, $options: 'i' } 
      })
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'This question already exists'
        })
      }
    }

    faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      {
        question: question ? question.trim() : faq.question,
        answer: answer ? answer.trim() : faq.answer,
        category: category || faq.category,
        tags: tags || faq.tags,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      data: faq
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating FAQ',
      error: error.message
    })
  }
}

// DELETE FAQ (admin only)
exports.deleteFAQ = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete FAQs'
      })
    }

    const faq = await FAQ.findByIdAndDelete(req.params.id)

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully',
      data: {}
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting FAQ',
      error: error.message
    })
  }
}

// UPVOTE FAQ
exports.upvoteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    )

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      })
    }

    res.status(200).json({
      success: true,
      data: faq
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error upvoting FAQ',
      error: error.message
    })
  }
}
