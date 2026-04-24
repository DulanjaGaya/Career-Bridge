import express from 'express';
import {
    createLobby,
    getLobbies,
    getLobbyById,
    joinLobby,
    nextQuestion,
    closeLobby,
    restartLobby
} from '../controllers/lobbyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createLobby).get(getLobbies);
router.route('/:id').get(protect, getLobbyById);
router.route('/:id/join').post(protect, joinLobby);
router.route('/:id/next-question').patch(protect, nextQuestion);
router.route('/:id/restart').patch(protect, restartLobby);
router.route('/:id/close').patch(protect, closeLobby);

export default router;
