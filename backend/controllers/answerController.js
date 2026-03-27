import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import Lobby from '../models/Lobby.js';

// @desc    Submit an answer
// @route   POST /api/answers
// @access  Private
export const submitAnswer = async (req, res, next) => {
    try {
        const { lobbyId, questionId, selectedOption } = req.body;

        const lobby = await Lobby.findById(lobbyId).select('questions status');
        if (!lobby) {
            res.status(404);
            throw new Error('Lobby not found');
        }

        if (lobby.status === 'closed') {
            res.status(400);
            throw new Error('This lobby is closed');
        }

        const lobbyQuestionIds = lobby.questions.map((qId) => qId.toString());
        if (!lobbyQuestionIds.includes(questionId)) {
            res.status(400);
            throw new Error('Question does not belong to this lobby');
        }

        const userAnswers = await Answer.find({
            lobbyId,
            userId: req.user._id,
        }).select('questionId attemptNo');

        const latestAttemptNo = userAnswers.reduce((max, ans) => Math.max(max, ans.attemptNo || 1), 1);
        const currentAttemptAnswers = userAnswers.filter((ans) => (ans.attemptNo || 1) === latestAttemptNo);
        const currentAttemptAnsweredSet = new Set(currentAttemptAnswers.map((ans) => ans.questionId.toString()));

        const isCurrentAttemptComplete = lobbyQuestionIds.length > 0 && currentAttemptAnsweredSet.size >= lobbyQuestionIds.length;
        const attemptNo = isCurrentAttemptComplete ? latestAttemptNo + 1 : latestAttemptNo;

        if (!isCurrentAttemptComplete && currentAttemptAnsweredSet.has(questionId)) {
            res.status(400);
            throw new Error('You already answered this question in the current attempt');
        }

        const question = await Question.findById(questionId);
        if (!question) {
            res.status(404);
            throw new Error('Question not found');
        }

        const isCorrect = question.correctAnswer === selectedOption;

        const answer = await Answer.create({
            lobbyId,
            questionId,
            userId: req.user._id,
            attemptNo,
            selectedOption,
            isCorrect,
        });

        res.status(201).json(answer);
    } catch (error) {
        next(error);
    }
};

// @desc    Get results for a question in a lobby
// @route   GET /api/answers/results/:lobbyId/:questionId
// @access  Private
export const getResults = async (req, res, next) => {
    try {
        const answers = await Answer.find({ 
            lobbyId: req.params.lobbyId, 
            questionId: req.params.questionId 
        }).populate('userId', 'name');

        res.json(answers);
    } catch (error) {
        next(error);
    }
};

// @desc    Get scoreboard for a lobby
// @route   GET /api/answers/scoreboard/:lobbyId
// @access  Private
export const getScoreboard = async (req, res, next) => {
    try {
        const answers = await Answer.find({ lobbyId: req.params.lobbyId }).populate('userId', 'name');
        
        // Calculate scores
        const scoreboardMap = {};
        
        answers.forEach(ans => {
            const userId = ans.userId._id.toString();
            if (!scoreboardMap[userId]) {
                scoreboardMap[userId] = {
                    name: ans.userId.name,
                    score: 0
                };
            }
            if (ans.isCorrect) {
                scoreboardMap[userId].score += 10; // 10 points per correct answer
            }
        });
        
        // Convert to array and sort by score descending
        const scoreboard = Object.values(scoreboardMap).sort((a, b) => b.score - a.score);

        res.json(scoreboard);
    } catch (error) {
        next(error);
    }
};
