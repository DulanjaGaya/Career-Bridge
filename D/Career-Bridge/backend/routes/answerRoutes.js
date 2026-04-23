import express from 'express';
import {
    submitAnswer,
    getResults,
    getScoreboard
} from '../controllers/answerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, submitAnswer);
router.route('/results/:lobbyId/:questionId').get(protect, getResults);
router.route('/scoreboard/:lobbyId').get(protect, getScoreboard);

export default router;
