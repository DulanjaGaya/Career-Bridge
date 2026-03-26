import Resource from '../models/Resource.js';
import Progress from '../models/Progress.js';
import PDFDocument from 'pdfkit';

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

// @desc    Download completion report as PDF
// @route   GET /api/resources/report/download
// @access  Private
export const downloadReport = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const completions = await Progress.find({ userId })
            .populate('resourceId', 'title topic type difficulty')
            .sort({ completedAt: -1 });

        // PDF generation
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="completion-report.pdf"');
        doc.pipe(res);

        // Header bar
        doc.rect(0, 0, doc.page.width, 60).fill('#2563eb');
        doc
            .fillColor('white')
            .fontSize(26)
            .font('Helvetica-Bold')
            .text('Resource Completion Report', 0, 18, { align: 'center', width: doc.page.width });
        doc.moveDown(2);
        doc.fillColor('black').font('Helvetica').fontSize(12);

        // User info
        doc.moveDown(0.5);
        doc.text(`User: ${req.user.name || ''}`);
        doc.text(`Generated: ${new Date().toLocaleString()}`);
        doc.text(`Total Completed: ${completions.length}`);
        doc.moveDown(1.5);

        // Table header
        const tableTop = doc.y;
        const colX = [40, 210, 320, 400, 490];
        doc
            .font('Helvetica-Bold')
            .fontSize(13)
            .fillColor('#2563eb')
            .text('Title', colX[0], tableTop, { width: colX[1] - colX[0] - 5 })
            .text('Topic', colX[1], tableTop, { width: colX[2] - colX[1] - 5 })
            .text('Type', colX[2], tableTop, { width: colX[3] - colX[2] - 5 })
            .text('Difficulty', colX[3], tableTop, { width: colX[4] - colX[3] - 5 })
            .text('Completed', colX[4], tableTop, { width: 80 });
        doc.moveTo(colX[0], doc.y + 15).lineTo(550, doc.y + 15).stroke('#2563eb');

        // Table rows
        let y = doc.y + 20;
        completions.forEach((completion, idx) => {
            // Alternate row color
            if (idx % 2 === 0) {
                doc.rect(colX[0], y - 2, 510, 20).fill('#f1f5f9').fillColor('black');
            }
            doc
                .font('Helvetica')
                .fontSize(11)
                .fillColor('black')
                .text(completion.resourceId.title, colX[0] + 4, y, { width: colX[1] - colX[0] - 8 })
                .text(completion.resourceId.topic, colX[1] + 4, y, { width: colX[2] - colX[1] - 8 })
                .text(completion.resourceId.type, colX[2] + 4, y, { width: colX[3] - colX[2] - 8 })
                .text(completion.resourceId.difficulty, colX[3] + 4, y, { width: colX[4] - colX[3] - 8 })
                .text(new Date(completion.completedAt).toLocaleDateString(), colX[4] + 4, y, { width: 80 });
            y += 20;
            doc.fillColor('black');
        });

        // Footer
        doc.fontSize(10).fillColor('#64748b');
        doc.text('Generated by ITPM Resource Tracker', 0, doc.page.height - 40, { align: 'center', width: doc.page.width });

        doc.end();
    } catch (error) {
        next(error);
    }
};
