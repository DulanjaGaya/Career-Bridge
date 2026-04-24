const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateUser } = require('../middleware/auth');
const { checkEmployerRole } = require('../middleware/employerAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  validateJobCreation, 
  validateJobUpdate, 
  validateSearchFilters 
} = require('../utils/validators');

// Multer configuration for job poster uploads
const posterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'posters');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const posterFileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Only JPG, JPEG, PNG, and WEBP images are allowed'));
  }
  cb(null, true);
};

const posterUpload = multer({
  storage: posterStorage,
  fileFilter: posterFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const posterUploadSingle = (req, res, next) => {
  const handler = posterUpload.single('poster');
  handler(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

// Public routes (for students)
router.get('/active', validateSearchFilters, jobController.getActiveJobs);
router.get('/active/:id', jobController.getPublicJobById);

// Employer routes (require authentication and employer role)
router.use(authenticateUser, checkEmployerRole); // Apply auth + employer role check to all routes below

router.post('/', posterUploadSingle, validateJobCreation, jobController.createJob);
router.get('/my-posts', jobController.getEmployerJobs);
router.get('/statistics', jobController.getJobStatistics);
router.get('/:id', jobController.getJobById);
router.get('/:id/applications', jobController.getJobApplications);
router.put('/:id/applications/:applicationId/viewed', jobController.markApplicationViewed);
router.put('/:id/applications/:applicationId/status', jobController.updateApplicationStatus);
router.put('/:id', posterUploadSingle, validateJobUpdate, jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router;