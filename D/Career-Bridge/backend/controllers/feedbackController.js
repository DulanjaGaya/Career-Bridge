import Feedback from '../models/Feedback.js';
import Resource from '../models/Resource.js';

// @desc    Add or update feedback for a resource
// @route   POST /api/feedback
// @access  Private
export const addFeedback = async (req, res, next) => {
    try {
        const { resourceId, rating, comment } = req.body;

        if (!resourceId || !rating) {
            res.status(400);
            throw new Error('Resource ID and rating are required');
        }

        if (rating < 1 || rating > 5) {
            res.status(400);
            throw new Error('Rating must be between 1 and 5');
        }

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            res.status(404);
            throw new Error('Resource not found');
        }

        let feedback = await Feedback.findOne({
            userId: req.user._id,
            resourceId
        });

        if (feedback) {
            feedback.rating = rating;
            feedback.comment = comment;
            await feedback.save();
            res.json({ message: 'Feedback updated', feedback });
        } else {
            feedback = await Feedback.create({
                userId: req.user._id,
                resourceId,
                rating,
                comment
            });
            res.status(201).json({ message: 'Feedback added', feedback });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get feedback for a resource
// @route   GET /api/feedback/:resourceId
// @access  Private
export const getFeedback = async (req, res, next) => {
    try {
        const { resourceId } = req.params;

        const feedback = await Feedback.findOne({
            userId: req.user._id,
            resourceId
        });

        if (feedback) {
            res.json(feedback);
        } else {
            res.json({ message: 'No feedback found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all feedback for a resource (public ratings)
// @route   GET /api/feedback/resource/:resourceId
// @access  Private
export const getResourceFeedback = async (req, res, next) => {
    try {
        const { resourceId } = req.params;

        const feedbacks = await Feedback.find({ resourceId })
            .populate('userId', 'name')
            .exec();

        const averageRating = feedbacks.length > 0
            ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
            : 0;

        res.json({
            averageRating,
            totalReviews: feedbacks.length,
            feedbacks
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:resourceId
// @access  Private
export const deleteFeedback = async (req, res, next) => {
    try {
        const { resourceId } = req.params;

        const feedback = await Feedback.findOneAndDelete({
            userId: req.user._id,
            resourceId
        });

        if (!feedback) {
            res.status(404);
            throw new Error('Feedback not found');
        }

        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        next(error);
    }
};
