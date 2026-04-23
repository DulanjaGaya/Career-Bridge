/**
 * Validation Utilities for Career Bridge
 */

// Trim whitespace
export const trimString = (str) => {
  return typeof str === 'string' ? str.trim() : ''
}

// Sanitize HTML/XSS
export const sanitizeInput = (str) => {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// Check if text contains at least one letter (prevents numbers/symbols only)
export const hasLetters = (text) => {
  return /[a-zA-Z]/.test(text)
}

// Check if input is empty or only whitespace
export const isEmpty = (text) => {
  return !trimString(text)
}

// Validate message/text (not empty, within length limits, must contain letters)
export const validateMessage = (message, options = {}) => {
  const {
    minLength = 5,
    maxLength = 1000,
    fieldName = 'Message'
  } = options

  const trimmed = trimString(message)
  
  // Check if empty
  if (!trimmed) {
    return { valid: false, error: `${fieldName} is required` }
  }
  
  // Check if only numbers/symbols (no letters)
  if (!hasLetters(trimmed)) {
    return { valid: false, error: `${fieldName} must contain at least one letter` }
  }
  
  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` }
  }
  
  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} must not exceed ${maxLength} characters` }
  }
  
  return { valid: true, value: trimmed }
}

// Validate rating
export const validateRating = (rating) => {
  const num = Number(rating)
  
  if (!rating || isNaN(num)) {
    return { valid: false, error: 'Rating is required' }
  }
  
  if (num < 1 || num > 5) {
    return { valid: false, error: 'Rating must be between 1 and 5' }
  }
  
  return { valid: true, value: num }
}

// Validate feedback message
export const validateFeedbackMessage = (message) => {
  return validateMessage(message, {
    minLength: 5,
    maxLength: 1000,
    fieldName: 'Feedback message'
  })
}

// Validate comment
export const validateComment = (comment) => {
  return validateMessage(comment, {
    minLength: 5,
    maxLength: 500,
    fieldName: 'Comment'
  })
}

// Validate FAQ question
export const validateFAQQuestion = (question) => {
  return validateMessage(question, {
    minLength: 5,
    maxLength: 150,
    fieldName: 'Question'
  })
}

// Validate FAQ answer
export const validateFAQAnswer = (answer) => {
  return validateMessage(answer, {
    minLength: 10,
    maxLength: 2000,
    fieldName: 'Answer'
  })
}

// Validate Q&A title
export const validateQATitle = (title) => {
  return validateMessage(title, {
    minLength: 5,
    maxLength: 150,
    fieldName: 'Title'
  })
}

// Validate Q&A description
export const validateQADescription = (description) => {
  return validateMessage(description, {
    minLength: 10,
    maxLength: 1000,
    fieldName: 'Description'
  })
}

// Validate Q&A answer
export const validateQAAnswer = (answer) => {
  return validateMessage(answer, {
    minLength: 5,
    maxLength: 1000,
    fieldName: 'Answer'
  })
}

// Validate category selection
export const validateCategory = (category) => {
  const trimmed = trimString(category)
  if (!trimmed) {
    return { valid: false, error: 'Category is required' }
  }
  return { valid: true, value: trimmed }
}

// Check for duplicate in array
export const checkDuplicate = (value, existingArray, field = 'value') => {
  const normalizedValue = trimString(value).toLowerCase()
  const isDuplicate = existingArray.some(
    item => trimString(item[field]).toLowerCase() === normalizedValue
  )
  return {
    isDuplicate,
    error: isDuplicate ? `This ${field} already exists` : null
  }
}

// Get clean input
export const getCleanInput = (input) => {
  return sanitizeInput(trimString(input))
}

// Validate all feedback form data
export const validateFeedbackForm = (message, rating, type) => {
  const errors = {}
  
  const messageValidation = validateFeedbackMessage(message)
  if (!messageValidation.valid) {
    errors.message = messageValidation.error
  }
  
  const ratingValidation = validateRating(rating)
  if (!ratingValidation.valid) {
    errors.rating = ratingValidation.error
  }
  
  const categoryValidation = validateCategory(type)
  if (!categoryValidation.valid) {
    errors.type = categoryValidation.error
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

// Validate all FAQ form data
export const validateFAQForm = (question, answer, category) => {
  const errors = {}
  
  const questionValidation = validateFAQQuestion(question)
  if (!questionValidation.valid) {
    errors.question = questionValidation.error
  }
  
  const answerValidation = validateFAQAnswer(answer)
  if (!answerValidation.valid) {
    errors.answer = answerValidation.error
  }
  
  const categoryValidation = validateCategory(category)
  if (!categoryValidation.valid) {
    errors.category = categoryValidation.error
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

// Validate all Q&A form data
export const validateQAForm = (title, description) => {
  const errors = {}
  
  const titleValidation = validateQATitle(title)
  if (!titleValidation.valid) {
    errors.title = titleValidation.error
  }
  
  const descriptionValidation = validateQADescription(description)
  if (!descriptionValidation.valid) {
    errors.description = descriptionValidation.error
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

// Validate user answer on Q&A
export const validateUserAnswer = (answer) => {
  return validateMessage(answer, {
    minLength: 5,
    maxLength: 1000,
    fieldName: 'Answer'
  })
}

// Validate admin official answer
export const validateOfficialAnswer = (answer) => {
  return validateMessage(answer, {
    minLength: 10,
    maxLength: 2000,
    fieldName: 'Official Answer'
  })
}

// Validate Q&A status change
export const validateQAStatus = (status) => {
  const validStatuses = ['Open', 'Answered', 'Resolved']
  if (!status || !validStatuses.includes(status)) {
    return { valid: false, error: 'Invalid status. Must be Open, Answered, or Resolved' }
  }
  return { valid: true, value: status }
}

// Validate Q&A answer submission (user side)
export const validateQAAnswerSubmission = (answer) => {
  const errors = {}
  
  const answerValidation = validateUserAnswer(answer)
  if (!answerValidation.valid) {
    errors.answer = answerValidation.error
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: answerValidation.valid ? getCleanInput(answer) : null
  }
}

// Validate admin official answer submission
export const validateOfficialAnswerSubmission = (answer) => {
  const errors = {}
  
  const answerValidation = validateOfficialAnswer(answer)
  if (!answerValidation.valid) {
    errors.answer = answerValidation.error
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: answerValidation.valid ? getCleanInput(answer) : null
  }
}
