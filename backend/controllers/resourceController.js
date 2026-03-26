import Resource from '../models/Resource.js';
import Progress from '../models/Progress.js';

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

// @desc    Add PDF resource link
// @route   POST /api/resources/add-pdf
// @access  Private
export const addPdfResource = async (req, res, next) => {
    try {
        const { title, topic, url, description, difficulty } = req.body;

        if (!title || !topic || !url) {
            res.status(400);
            throw new Error('Title, topic, and URL are required');
        }

        const resource = await Resource.create({
            title,
            topic,
            type: 'pdf',
            url,
            description,
            difficulty: difficulty || 'Medium'
        });

        res.status(201).json({ message: 'PDF resource added successfully', resource });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's completion timeline
// @route   GET /api/resources/timeline
// @access  Private
export const getTimeline = async (req, res, next) => {
    try {
        const completions = await Progress.find({ userId: req.user._id })
            .populate('resourceId', 'title topic type difficulty')
            .sort({ completedAt: -1 });

        const timeline = completions.map(completion => ({
            resourceId: completion.resourceId._id,
            resourceTitle: completion.resourceId.title,
            resourceTopic: completion.resourceId.topic,
            completedAt: completion.completedAt,
            createdAt: completion.createdAt
        }));

        res.json(timeline);
    } catch (error) {
        next(error);
    }
};

// @desc    Download completion report as CSV/JSON
// @route   GET /api/resources/report/download
// @access  Private
export const downloadReport = async (req, res, next) => {
    try {
        const { format } = req.query;
        const userId = req.user._id;

        const completions = await Progress.find({ userId })
            .populate('resourceId', 'title topic type difficulty')
            .sort({ completedAt: -1 });

        const reportData = completions.map(completion => ({
            resourceTitle: completion.resourceId.title,
            topic: completion.resourceId.topic,
            type: completion.resourceId.type,
            difficulty: completion.resourceId.difficulty,
            completedAt: completion.completedAt,
            completedDate: new Date(completion.completedAt).toLocaleDateString(),
            daysAgo: Math.floor((Date.now() - new Date(completion.completedAt)) / (1000 * 60 * 60 * 24))
        }));

        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="completion-report.json"');
            res.json({
                userName: req.user.name,
                generatedAt: new Date(),
                totalCompleted: reportData.length,
                completions: reportData
            });
        } else {
            // CSV format
            let csv = 'Resource Title,Topic,Type,Difficulty,Completed Date,Days Ago\n';
            reportData.forEach(item => {
                csv += `"${item.resourceTitle}","${item.topic}","${item.type}","${item.difficulty}","${item.completedDate}",${item.daysAgo}\n`;
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="completion-report.csv"');
            res.send(csv);
        }
    } catch (error) {
        next(error);
    }
};
