const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { checkStudentRole } = require('../middleware/studentAuth');
const studentController = require('../controllers/studentController');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration for resume uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '..', 'uploads', 'resumes'));
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname) || '';
		cb(null, `${uniqueSuffix}${ext}`);
	},
});

const fileFilter = (req, file, cb) => {
	const allowed = ['.pdf', '.doc', '.docx'];
	const ext = path.extname(file.originalname).toLowerCase();
	if (!allowed.includes(ext)) {
		return cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
	}
	cb(null, true);
};

const upload = multer({ storage, fileFilter });

// All student routes require authentication and student role
router.use(authenticateUser, checkStudentRole);

// Applications
router.post('/jobs/:jobId/apply', upload.single('resume'), studentController.applyForJob);
router.get('/applied-jobs', studentController.getAppliedJobs);
router.put('/applications/:applicationId', upload.single('resume'), studentController.updateApplication);
router.delete('/applications/:applicationId', studentController.deleteApplication);

// Saved jobs
router.post('/jobs/:jobId/save', studentController.saveJob);
router.delete('/jobs/:jobId/save', studentController.unsaveJob);
router.get('/saved-jobs', studentController.getSavedJobs);

// Profile
router.put('/profile', studentController.updateProfile);
router.get('/profile', studentController.getProfile);

// Statistics
router.get('/statistics', studentController.getApplicationStats);

module.exports = router;
