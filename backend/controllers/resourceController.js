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

// Allowed values for validation
const ALLOWED_TYPES = ['video', 'pdf', 'article'];
const ALLOWED_TOPICS = ['DSA', 'OOP', 'System Design', 'DBMS', 'Web Dev', 'HR'];
const ALLOWED_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// URL validation helpers
const isValidUrl = (str) => {
    try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

const isValidYouTubeUrl = (url) => {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        if (hostname.includes('youtube.com')) {
            return !!urlObj.searchParams.get('v');
        }
        if (hostname.includes('youtu.be')) {
            return urlObj.pathname.length > 1;
        }
        return false;
    } catch {
        return false;
    }
};

// @desc    Add a new resource (video, pdf, or article)
// @route   POST /api/resources/add
// @access  Private
export const addResource = async (req, res, next) => {
    try {
        const { title, topic, type, url, description, difficulty } = req.body;

        // --- Validation ---
        if (!title || !title.trim()) {
            res.status(400);
            throw new Error('Title is required');
        }

        if (title.trim().length < 3 || title.trim().length > 200) {
            res.status(400);
            throw new Error('Title must be between 3 and 200 characters');
        }

        if (!topic) {
            res.status(400);
            throw new Error('Topic is required');
        }

        if (!ALLOWED_TOPICS.includes(topic)) {
            res.status(400);
            throw new Error(`Topic must be one of: ${ALLOWED_TOPICS.join(', ')}`);
        }

        if (!type) {
            res.status(400);
            throw new Error('Type is required');
        }

        if (!ALLOWED_TYPES.includes(type)) {
            res.status(400);
            throw new Error(`Type must be one of: ${ALLOWED_TYPES.join(', ')}`);
        }

        if (!url || !url.trim()) {
            res.status(400);
            throw new Error('URL is required');
        }

        if (!isValidUrl(url)) {
            res.status(400);
            throw new Error('Please provide a valid URL (must start with http:// or https://)');
        }

        // For video type, validate it's a YouTube URL
        if (type === 'video' && !isValidYouTubeUrl(url)) {
            res.status(400);
            throw new Error('Video resources must have a valid YouTube URL (youtube.com or youtu.be)');
        }

        const validDifficulty = ALLOWED_DIFFICULTIES.includes(difficulty) ? difficulty : 'Medium';

        if (description && description.length > 1000) {
            res.status(400);
            throw new Error('Description must be under 1000 characters');
        }

        // Check for duplicate URL
        const existingResource = await Resource.findOne({ url: url.trim() });
        if (existingResource) {
            res.status(400);
            throw new Error('A resource with this URL already exists');
        }

        const resource = await Resource.create({
            title: title.trim(),
            topic,
            type,
            url: url.trim(),
            description: description?.trim() || '',
            difficulty: validDifficulty,
        });

        res.status(201).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} resource added successfully`, resource });
    } catch (error) {
        next(error);
    }
};

// @desc    Add PDF resource link (kept for backwards compatibility)
// @route   POST /api/resources/add-pdf
// @access  Private
export const addPdfResource = async (req, res, next) => {
    // Delegate to generic addResource with type forced to pdf
    req.body.type = 'pdf';
    return addResource(req, res, next);
};

// @desc    Get user's completion timeline
// @route   GET /api/resources/timeline
// @access  Private
export const getTimeline = async (req, res, next) => {
    try {
        const completions = await Progress.find({ userId: req.user._id })
            .populate('resourceId', 'title topic type difficulty')
            .sort({ completedAt: -1 });

        const timeline = completions.map((completion) => ({
            resourceId: completion.resourceId._id,
            resourceTitle: completion.resourceId.title,
            resourceTopic: completion.resourceId.topic,
            completedAt: completion.completedAt,
            createdAt: completion.createdAt,
        }));

        res.json(timeline);
    } catch (error) {
        next(error);
    }
};

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
    primary:      '#1E3A5F',   // deep navy
    accent:       '#2563EB',   // bright blue
    accentLight:  '#DBEAFE',   // pale blue tint
    rowAlt:       '#F8FAFC',   // near-white stripe
    border:       '#CBD5E1',   // slate-300
    textDark:     '#0F172A',   // slate-900
    textMid:      '#475569',   // slate-600
    textLight:    '#94A3B8',   // slate-400
    white:        '#FFFFFF',
    danger:       '#DC2626',   // red — hard
    warning:      '#D97706',   // amber — medium
    success:      '#16A34A',   // green — easy
};

const FONT = {
    regular: 'Helvetica',
    bold:    'Helvetica-Bold',
};

// Page geometry (A4 = 595.28 × 841.89 pt)
const PAGE_W    = 595.28;
const PAGE_H    = 841.89;
const MARGIN_X  = 50;          // left & right
const MARGIN_TOP = 50;
const MARGIN_BOT = 45;
const CONTENT_W = PAGE_W - MARGIN_X * 2;  // 495.28 pt

// Table column definitions  (widths must sum to CONTENT_W)
const COLS = [
    { label: 'Resource Title', key: 'title',      w: 180 },
    { label: 'Topic',          key: 'topic',       w:  95 },
    { label: 'Type',           key: 'type',        w:  65 },
    { label: 'Difficulty',     key: 'difficulty',  w:  75 },
    { label: 'Completed',      key: 'completedAt', w:  80 },
];
// Verify: 180+95+65+75+80 = 495 ✓

const ROW_H      = 26;   // standard row height
const HEADER_H   = 30;   // table header row height
const TABLE_FONT = 9.5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compute left-x of each column */
function colOffsets() {
    const offsets = [];
    let x = MARGIN_X;
    for (const col of COLS) {
        offsets.push(x);
        x += col.w;
    }
    return offsets;
}

/** Draw the table header row and return new Y position */
function drawTableHeader(doc, y) {
    const offsets = colOffsets();

    // Header background
    doc.rect(MARGIN_X, y, CONTENT_W, HEADER_H).fill(COLORS.primary);

    // Header labels
    doc.font(FONT.bold).fontSize(TABLE_FONT).fillColor(COLORS.white);
    COLS.forEach((col, i) => {
        doc.text(col.label, offsets[i] + 6, y + (HEADER_H - TABLE_FONT) / 2, {
            width: col.w - 10,
            lineBreak: false,
        });
    });

    return y + HEADER_H;
}

/** Draw a single data row; returns new Y */
function drawTableRow(doc, row, y, isEven) {
    const offsets = colOffsets();

    // Alternating row fill
    if (isEven) {
        doc.rect(MARGIN_X, y, CONTENT_W, ROW_H).fill(COLORS.rowAlt);
    } else {
        doc.rect(MARGIN_X, y, CONTENT_W, ROW_H).fill(COLORS.white);
    }

    // Difficulty badge colour
    const diffColor = {
        Easy:   COLORS.success,
        Medium: COLORS.warning,
        Hard:   COLORS.danger,
    }[row.difficulty] || COLORS.textMid;

    doc.font(FONT.regular).fontSize(TABLE_FONT).fillColor(COLORS.textDark);

    COLS.forEach((col, i) => {
        let value = row[col.key] ?? '—';

        if (col.key === 'completedAt' && value !== '—') {
            value = new Date(value).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
            });
        }

        if (col.key === 'difficulty') {
            // Coloured pill badge
            const badgeW = 60;
            const badgeH = 14;
            const bx = offsets[i] + 4;
            const by = y + (ROW_H - badgeH) / 2;
            doc.roundedRect(bx, by, badgeW, badgeH, 4).fill(diffColor);
            doc
                .font(FONT.bold)
                .fontSize(TABLE_FONT - 1)
                .fillColor(COLORS.white)
                .text(String(value), bx, by + 2.5, { width: badgeW, align: 'center', lineBreak: false });
            doc.font(FONT.regular).fontSize(TABLE_FONT).fillColor(COLORS.textDark);
        } else {
            doc.text(String(value), offsets[i] + 6, y + (ROW_H - TABLE_FONT) / 2 + 1, {
                width: col.w - 10,
                lineBreak: false,
                ellipsis: true,
            });
        }
    });

    // Bottom border
    doc
        .moveTo(MARGIN_X, y + ROW_H)
        .lineTo(MARGIN_X + CONTENT_W, y + ROW_H)
        .strokeColor(COLORS.border)
        .lineWidth(0.4)
        .stroke();

    // Vertical column dividers
    let vx = MARGIN_X;
    for (let i = 0; i < COLS.length - 1; i++) {
        vx += COLS[i].w;
        doc
            .moveTo(vx, y)
            .lineTo(vx, y + ROW_H)
            .strokeColor(COLORS.border)
            .lineWidth(0.4)
            .stroke();
    }

    return y + ROW_H;
}

/** Draw outer table border */
function drawTableBorder(doc, tableStartY, tableEndY) {
    doc
        .rect(MARGIN_X, tableStartY, CONTENT_W, tableEndY - tableStartY)
        .strokeColor(COLORS.primary)
        .lineWidth(1)
        .stroke();
}

/** Add page number footer */
function addPageNumber(doc, pageNum, totalPages) {
    const y = PAGE_H - MARGIN_BOT + 10;
    doc
        .font(FONT.regular)
        .fontSize(8)
        .fillColor(COLORS.textLight)
        .text(
            `Page ${pageNum} of ${totalPages}`,
            MARGIN_X,
            y,
            { width: CONTENT_W, align: 'right' }
        )
        .text(
            'Generated by ITPM Resource Tracker',
            MARGIN_X,
            y,
            { width: CONTENT_W, align: 'left' }
        );
}

/** Draw the page header (cover banner + meta info) — first page only */
function drawFirstPageHeader(doc, user, totalCount) {
    // ── Top accent bar ──────────────────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, 8).fill(COLORS.accent);

    // ── Main header band ────────────────────────────────────────────────────
    const bandY = 8;
    const bandH = 90;
    doc.rect(0, bandY, PAGE_W, bandH).fill(COLORS.primary);

    // Left decorative strip
    doc.rect(0, bandY, 6, bandH).fill(COLORS.accent);

    // Title
    doc
        .font(FONT.bold)
        .fontSize(22)
        .fillColor(COLORS.white)
        .text('Resource Completion Report', MARGIN_X + 10, bandY + 18, {
            width: CONTENT_W * 0.65,
            lineBreak: false,
        });

    // Subtitle
    doc
        .font(FONT.regular)
        .fontSize(10)
        .fillColor(COLORS.accentLight)
        .text('ITPM Learning Platform  •  Performance Summary', MARGIN_X + 10, bandY + 46);

    // (Removed badge box for a cleaner look)

    // ── Meta info row ────────────────────────────────────────────────────────
    const metaY = bandY + bandH + 16;

    // Light rule
    doc.rect(MARGIN_X, metaY, CONTENT_W, 52).roundedRect(MARGIN_X, metaY, CONTENT_W, 52, 6).fill('#F1F5F9');
    doc.rect(MARGIN_X, metaY, 4, 52).fill(COLORS.accent);

    const labelStyle = () =>
        doc.font(FONT.bold).fontSize(8).fillColor(COLORS.textMid);
    const valueStyle = () =>
        doc.font(FONT.regular).fontSize(10).fillColor(COLORS.textDark);

    // Column 1: User
    labelStyle().text('PREPARED FOR', MARGIN_X + 14, metaY + 10);
    valueStyle().text(user.name || 'N/A', MARGIN_X + 14, metaY + 22);

    // Column 2: Date
    const col2X = MARGIN_X + 180;
    labelStyle().text('GENERATED ON', col2X, metaY + 10);
    valueStyle().text(
        new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
        col2X,
        metaY + 22
    );

    // Column 3: Email (if available)
    const col3X = MARGIN_X + 360;
    labelStyle().text('USER EMAIL', col3X, metaY + 10);
    valueStyle().text(user.email || '—', col3X, metaY + 22);

    return metaY + 52 + 22; // return Y below meta box
}

// ─── Main Controller ──────────────────────────────────────────────────────────

// @desc    Download completion report as PDF
// @route   GET /api/resources/report/download
// @access  Private
export const downloadReport = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const completions = await Progress.find({ userId })
            .populate('resourceId', 'title topic type difficulty')
            .sort({ completedAt: -1 });

        // ── Build PDF ──────────────────────────────────────────────────────
        const doc = new PDFDocument({
            margin: 0,           // we control all margins manually
            size: 'A4',
            bufferPages: true,   // needed for total-page-count in footer
            info: {
                Title:   'Resource Completion Report',
                Author:  req.user.name || 'ITPM Tracker',
                Subject: 'Learning Progress',
                Creator: 'ITPM Resource Tracker',
            },
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="completion-report.pdf"');
        doc.pipe(res);

        // ── Page 1 header ──────────────────────────────────────────────────
        let currentY = drawFirstPageHeader(doc, req.user, completions.length);

        // ── Section label ──────────────────────────────────────────────────
        doc
            .font(FONT.bold)
            .fontSize(10)
            .fillColor(COLORS.primary)
            .text('COMPLETED RESOURCES', MARGIN_X, currentY, { characterSpacing: 1 });

        currentY += 16;

        // ── Table ──────────────────────────────────────────────────────────
        const USABLE_H = PAGE_H - MARGIN_BOT - 20;   // lowest safe Y per page
        let tableStartY = currentY;
        currentY = drawTableHeader(doc, currentY);
        let rowsOnThisPage = 0;
        let pageNum = 1;

        completions.forEach((completion, idx) => {
            const row = {
                title:       completion.resourceId?.title      ?? '—',
                topic:       completion.resourceId?.topic      ?? '—',
                type:        completion.resourceId?.type       ?? '—',
                difficulty:  completion.resourceId?.difficulty ?? '—',
                completedAt: completion.completedAt,
            };

            // Check if we need a new page
            if (currentY + ROW_H > USABLE_H) {
                // Close border on current page
                drawTableBorder(doc, tableStartY, currentY);
                addPageNumber(doc, pageNum, '?');   // placeholder; filled in later
                pageNum++;

                doc.addPage({ margin: 0, size: 'A4' });
                // Continuation header strip
                doc.rect(0, 0, PAGE_W, 8).fill(COLORS.accent);
                doc.rect(0, 8, PAGE_W, 28).fill(COLORS.primary);
                doc.rect(0, 8, 6, 28).fill(COLORS.accent);
                doc
                    .font(FONT.bold)
                    .fontSize(10)
                    .fillColor(COLORS.white)
                    .text('Resource Completion Report  (continued)', MARGIN_X + 10, 16, { lineBreak: false });

                currentY = 50;
                tableStartY = currentY;
                currentY = drawTableHeader(doc, currentY);
                rowsOnThisPage = 0;
            }

            currentY = drawTableRow(doc, row, currentY, idx % 2 === 0);
            rowsOnThisPage++;
        });

        // Close final table border
        drawTableBorder(doc, tableStartY, currentY);

        // ── Summary strip below table ──────────────────────────────────────
        if (currentY + 40 < USABLE_H) {
            currentY += 12;
            doc.rect(MARGIN_X, currentY, CONTENT_W, 28).fill(COLORS.accentLight);
            doc
                .font(FONT.bold)
                .fontSize(9)
                .fillColor(COLORS.primary)
                .text(
                    `Total resources completed: ${completions.length}`,
                    MARGIN_X + 10,
                    currentY + 9,
                    { width: CONTENT_W - 20 }
                );
        }

        // ── Paginate all pages ─────────────────────────────────────────────
        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i++) {
            doc.switchToPage(i);
            addPageNumber(doc, i + 1, totalPages);
        }

        doc.end();
    } catch (error) {
        next(error);
    }
};