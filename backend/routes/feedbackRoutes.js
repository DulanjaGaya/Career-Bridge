import express from 'express';
import { addFeedback, getFeedback, getResourceFeedback, deleteFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Specific routes first to avoid parameter conflicts
router.post('/', protect, addFeedback);
router.get('/resource/:resourceId', protect, getResourceFeedback);
router.get('/:resourceId', protect, getFeedback);
router.delete('/:resourceId', protect, deleteFeedback);

export default router;
