import express from 'express';
import { getQuestions } from '../controllers/questionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getQuestions);

export default router;
