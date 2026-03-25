import Progress from '../models/Progress.js';
import Resource from '../models/Resource.js';

// @desc    Toggle completion status of a resource
// @route   POST /api/progress/toggle
// @access  Private
export const toggleProgress = async (req, res, next) => {
    try {
        const { resourceId } = req.body;

        const resourceMatch = await Resource.findById(resourceId);
        if (!resourceMatch) {
            res.status(404);
            throw new Error('Resource not found');
        }

        const existingProgress = await Progress.findOne({
            userId: req.user._id,
            resourceId
        });

        if (existingProgress) {
            // Unmark as complete
            await Progress.deleteOne({ _id: existingProgress._id });
            res.status(200).json({ status: 'incomplete', resourceId });
        } else {
            // Mark as complete
            await Progress.create({
                userId: req.user._id,
                resourceId
            });
            res.status(201).json({ status: 'completed', resourceId });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's progress summary for all resources
// @route   GET /api/progress/summary
// @access  Private
export const getProgressSummary = async (req, res, next) => {
    try {
        // Fetch all progress records for the user
        const completedRecords = await Progress.find({ userId: req.user._id })
                                            .populate('resourceId', 'topic');
        
        // Group by topic to show how many they've done in each section
        const stats = {
            totalCompleted: completedRecords.length,
            topics: {}
        };

        completedRecords.forEach(record => {
            const topic = record.resourceId.topic;
            if (!stats.topics[topic]) {
                stats.topics[topic] = 0;
            }
            stats.topics[topic] += 1;
        });

        const completedResourceIds = completedRecords.map(r => r.resourceId._id.toString());

        res.json({
            stats,
            completedResourceIds
        });
    } catch (error) {
        next(error);
    }
};
