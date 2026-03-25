import express from 'express';
import { toggleProgress, getProgressSummary } from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/toggle').post(protect, toggleProgress);
router.route('/summary').get(protect, getProgressSummary);

export default router;
