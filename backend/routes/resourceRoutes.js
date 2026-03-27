import express from 'express';
import { getResources, getResourceById, addPdfResource, addResource, updateResource, deleteResource, getTimeline, downloadReport } from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Specific routes first
router.post('/add', protect, addResource);
router.post('/add-pdf', protect, addPdfResource);
router.get('/timeline', protect, getTimeline);
router.get('/report/download', protect, downloadReport);

// General routes
router.route('/').get(protect, getResources);
router.route('/:id')
    .get(protect, getResourceById)
    .put(protect, updateResource)
    .delete(protect, deleteResource);

export default router;
