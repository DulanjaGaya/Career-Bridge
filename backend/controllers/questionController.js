import Question from '../models/Question.js';

// @desc    Get questions by topic
// @route   GET /api/questions
// @access  Private
export const getQuestions = async (req, res, next) => {
    try {
        const topic = req.query.topic;
        const query = topic ? { topic } : {};
        
        // Hide the correct answer from the pure fetch unless specified logic elsewhere
        const questions = await Question.find(query).select('-correctAnswer');
        
        res.json(questions);
    } catch (error) {
        next(error);
    }
};
