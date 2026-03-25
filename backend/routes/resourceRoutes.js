import express from 'express';
import { getResources, getResourceById } from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getResources);
router.route('/:id').get(protect, getResourceById);

export default router;
