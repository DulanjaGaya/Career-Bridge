import Answer from '../models/Answer.js';
import Question from '../models/Question.js';

// @desc    Submit an answer
// @route   POST /api/answers
// @access  Private
export const submitAnswer = async (req, res, next) => {
    try {
        const { lobbyId, questionId, selectedOption } = req.body;

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
