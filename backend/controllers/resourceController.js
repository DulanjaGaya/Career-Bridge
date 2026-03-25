import Resource from '../models/Resource.js';

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
export const getResources = async (req, res, next) => {
    try {
        const { topic, type, difficulty } = req.query;
        let query = {};
        
        if (topic) query.topic = topic;
        if (type) query.type = type;
        if (difficulty) query.difficulty = difficulty;

        const resources = await Resource.find(query).sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
export const getResourceById = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (resource) {
            res.json(resource);
        } else {
            res.status(404);
            throw new Error('Resource not found');
        }
    } catch (error) {
        next(error);
    }
};
