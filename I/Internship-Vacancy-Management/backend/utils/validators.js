const { body, param, query, validationResult } = require('express-validator');

// Validate job creation
const validateJobCreation = [
  body('status')
    .optional()
    .isIn(['active', 'filled', 'expired', 'draft']).withMessage('Invalid status'),

  body('jobTitle')
    .trim()
    .isLength({ max: 100 }).withMessage('Job title cannot exceed 100 characters'),
  body('jobTitle').custom((value, { req }) => {
    const isDraft = req.body?.status === 'draft';
    if (isDraft) return true;
    if (!value || !String(value).trim()) {
      throw new Error('Job title is required');
    }
    return true;
  }),
  
  body('company')
    .trim(),
  body('company').custom((value, { req }) => {
    const isDraft = req.body?.status === 'draft';
    if (isDraft) return true;
    if (!value || !String(value).trim()) {
      throw new Error('Company name is required');
    }
    return true;
  }),
  
  body('specialization')
    .optional({ checkFalsy: true })
    .isIn([
      'Software Engineering', 'Web Development', 'Mobile Development',
      'Data Science', 'Machine Learning', 'DevOps', 'Cloud Computing',
      'Cybersecurity', 'UI/UX Design', 'Product Management', 'Quality Assurance',
      'IT Support', 'Network Administration', 'Database Administration', 'Other'
    ]).withMessage('Invalid specialization'),
  body('specialization').custom((value, { req }) => {
    const isDraft = req.body?.status === 'draft';
    if (isDraft) return true;
    if (!value || !String(value).trim()) {
      throw new Error('Specialization is required');
    }
    return true;
  }),
  
  body('requirements')
    .trim(),
  body('requirements').custom((value, { req }) => {
    const isDraft = req.body?.status === 'draft';
    if (isDraft) return true;
    if (!value || !String(value).trim()) {
      throw new Error('Requirements are required');
    }
    return true;
  }),
  
  body('description')
    .trim(),
  body('description').custom((value, { req }) => {
    const isDraft = req.body?.status === 'draft';
    if (isDraft) return true;
    if (!value || !String(value).trim()) {
      throw new Error('Description is required');
    }
    return true;
  }),
  
  body('location.city')
    .trim(),
  body('location.city').custom((value, { req }) => {
    const isDraft = req.body?.status === 'draft';
    if (isDraft) return true;
    if (!value || !String(value).trim()) {
      throw new Error('City is required');
    }
    return true;
  }),
  
  body('applicationDeadline')
    .custom((value, { req }) => {
      const isDraft = req.body?.status === 'draft';
      if (isDraft) return true;

      if (!value) {
        throw new Error('Application deadline is required');
      }

      const deadlineDate = new Date(value);
      if (Number.isNaN(deadlineDate.getTime())) {
        throw new Error('Invalid date format');
      }

      const currentDate = new Date();
      if (deadlineDate <= currentDate) {
        throw new Error('Application deadline must be in the future');
      }

      return true;
    }),
  
  body('positionsAvailable')
    .optional()
    .isInt({ min: 1 }).withMessage('Positions must be at least 1'),

  body('status')
    .optional()
    .isIn(['active', 'filled', 'expired', 'draft']).withMessage('Invalid status'),
  
  body('skills')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        // Multipart forms can send a single skills[] value as a string
        return value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return value;
    })
    .isArray().withMessage('Skills must be an array'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

// Validate job update
const validateJobUpdate = [
  param('id')
    .isMongoId().withMessage('Invalid job ID'),
  
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Job title cannot exceed 100 characters'),
  
  body('specialization')
    .optional()
    .isIn([
      'Software Engineering', 'Web Development', 'Mobile Development',
      'Data Science', 'Machine Learning', 'DevOps', 'Cloud Computing',
      'Cybersecurity', 'UI/UX Design', 'Product Management', 'Quality Assurance',
      'IT Support', 'Network Administration', 'Database Administration', 'Other'
    ]).withMessage('Invalid specialization'),
  
  body('requirements')
    .optional()
    .trim(),
  
  body('description')
    .optional()
    .trim(),
  
  body('location.city')
    .optional()
    .trim(),
  
  body('applicationDeadline')
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      if (!value) return true;

      const deadlineDate = new Date(value);
      if (Number.isNaN(deadlineDate.getTime())) {
        throw new Error('Invalid date format');
      }

      const isDraft = req.body?.status === 'draft';
      if (isDraft) return true;

      const currentDate = new Date();
      if (deadlineDate <= currentDate) {
        throw new Error('Application deadline must be in the future');
      }

      return true;
    }),
  
  body('positionsAvailable')
    .optional()
    .isInt({ min: 1 }).withMessage('Positions must be at least 1'),

  body('skills')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return value;
    })
    .isArray().withMessage('Skills must be an array'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

// Validate search and filter
const validateSearchFilters = [
  query('search')
    .optional()
    .isString().withMessage('Search query must be a string')
    .trim(),
  
  query('specialization')
    .optional()
    .isString().withMessage('Specialization must be a string'),
  
  query('city')
    .optional()
    .isString().withMessage('City must be a string'),
  
  query('status')
    .optional()
    .isIn(['active', 'filled', 'expired', 'draft', 'all']).withMessage('Invalid status'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
    .toInt(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

module.exports = { validateJobCreation, validateJobUpdate, validateSearchFilters };