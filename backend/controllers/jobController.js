const mongoose = require('mongoose');
const Job = require('../models/job');
const StudentJob = require('../models/studentJob');

const normalizeStoredUploadPath = (storedPath) => {
  if (!storedPath) return null;
  const normalized = String(storedPath).replace(/\\/g, '/');
  const uploadsIndex = normalized.lastIndexOf('/uploads/');
  if (uploadsIndex !== -1) {
    return normalized.slice(uploadsIndex + 1); // strip leading '/'
  }
  if (normalized.includes('uploads/')) {
    return normalized.slice(normalized.indexOf('uploads/'));
  }
  return normalized.startsWith('/') ? normalized.slice(1) : normalized;
};

const resumeUrlFromPath = (req, storedPath) => {
  const relative = normalizeStoredUploadPath(storedPath);
  if (!relative) return null;
  const host = `${req.protocol}://${req.get('host')}`;
  return `${host}/${relative}`;
};

// Create a new job posting
exports.createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      employerId: req.user.userId // Assuming req.user contains userId from auth middleware
    };

    if (req.file) {
      jobData.posterUrl = `/uploads/posters/${req.file.filename}`;
    }

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: job
    });
  } catch (error) {
    console.error('Error creating job:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create job posting',
      error: error.message
    });
  }
};

// Get all jobs for the current employer (Manage My Posts)
exports.getEmployerJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const employerId = new mongoose.Types.ObjectId(req.user.userId);

    const query = { employerId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// Get single job by ID (with access control)
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if employer owns this job
    if (job.employerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this job posting.'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
};

// Update job details
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if employer owns this job
    if (job.employerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this job posting.'
      });
    }

    // Prevent updating if job is filled
    if (job.status === 'filled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a filled position'
      });
    }

    const updateData = { ...req.body };

    // Apply updates to the loaded document so full validation runs,
    // especially important when transitioning draft -> active.
    job.set(updateData);
    job.updatedAt = Date.now();
    if (req.file) {
      job.posterUrl = `/uploads/posters/${req.file.filename}`;
    }

    const updatedJob = await job.save();

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
};

// Delete/Remove job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if employer owns this job
    if (job.employerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this job posting.'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
};

// Get all active jobs for students (with search and filter)
exports.getActiveJobs = async (req, res) => {
  try {
    const { search, specialization, city, page = 1, limit = 10 } = req.query;
    
    // Build query for active jobs only
    let query = { status: 'active' };
    
    // Add search functionality
    if (search && search.trim()) {
      query.$text = { $search: search };
    }
    
    // Filter by specialization
    if (specialization) {
      query.specialization = specialization;
    }
    
    // Filter by city
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }
    
    // Ensure deadline is not expired
    query.applicationDeadline = { $gt: new Date() };
    
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v'); // Exclude version field
    
    const total = await Job.countDocuments(query);
    
    // Get unique specializations and cities for filter options
    const specializations = await Job.distinct('specialization', { status: 'active' });
    const cities = await Job.distinct('location.city', { status: 'active' });
    
    res.status(200).json({
      success: true,
      data: jobs,
      filters: {
        specializations,
        cities
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// Get single active job by ID for students (public)
exports.getPublicJobById = async (req, res) => {
  try {
    const now = new Date();
    const job = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'active',
        applicationDeadline: { $gt: now },
      },
      { $inc: { views: 1 } },
      { new: true }
    ).select('-__v');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Error fetching public job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message,
    });
  }
};

// Get applications for a specific job (employer view)
exports.getJobApplications = async (req, res) => {
  try {
    const employerId = req.user.userId;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.employerId.toString() !== employerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this job posting.',
      });
    }

    const applications = await StudentJob.find({ jobId, hasApplied: true })
      .sort({ appliedAt: -1 })
      .populate('studentId', 'name email studentProfile');

    const result = applications.map((a) => ({
      id: a._id,
      studentName: a.studentId?.name,
      studentEmail: a.studentId?.email,
      appliedAt: a.appliedAt,
      status: a.status === 'reviewed' ? 'viewed' : a.status,
      coverLetter: a.coverLetter,
      resumeUrl: resumeUrlFromPath(req, a.resumePath),
    }));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job applications',
      error: error.message,
    });
  }
};

// Get job statistics for employer dashboard
exports.getJobStatistics = async (req, res) => {
  try {
    const employerId = new mongoose.Types.ObjectId(req.user.userId);

    const jobs = await Job.find({ employerId }).select('_id status views applicationsCount');
    const jobIds = jobs.map((j) => j._id);

    const totalJobs = jobs.length;
    const totalViews = jobs.reduce((sum, j) => sum + (j.views || 0), 0);

    const jobStatusCounts = jobs.reduce(
      (acc, j) => {
        const key = j.status || 'active';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {}
    );

    let totalApplications = 0;
    let statusCounts = { pending: 0, viewed: 0, interview: 0, accepted: 0, rejected: 0 };
    let weeklyData = [0, 0, 0, 0];
    let avgResponseTimeDays = 0;

    if (jobIds.length > 0) {
      totalApplications = await StudentJob.countDocuments({
        jobId: { $in: jobIds },
        hasApplied: true,
      });

      const statusAgg = await StudentJob.aggregate([
        { $match: { jobId: { $in: jobIds }, hasApplied: true } },
        {
          $project: {
            status: { $ifNull: ['$status', 'pending'] },
          },
        },
        {
          $addFields: {
            status: {
              $cond: [{ $eq: ['$status', 'reviewed'] }, 'viewed', '$status'],
            },
          },
        },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      statusCounts = { pending: 0, viewed: 0, interview: 0, accepted: 0, rejected: 0 };
      statusAgg.forEach((row) => {
        if (statusCounts[row._id] !== undefined) {
          statusCounts[row._id] = row.count;
        }
      });

      // Weekly application trend (last 4 weeks, oldest -> newest)
      const now = new Date();
      const windowStart = new Date(now);
      windowStart.setHours(0, 0, 0, 0);
      windowStart.setDate(windowStart.getDate() - 27);

      const weeklyAgg = await StudentJob.aggregate([
        {
          $match: {
            jobId: { $in: jobIds },
            hasApplied: true,
            appliedAt: { $gte: windowStart, $lte: now },
          },
        },
        {
          $addFields: {
            weekIndex: {
              $dateDiff: {
                startDate: '$appliedAt',
                endDate: now,
                unit: 'week',
              },
            },
          },
        },
        { $match: { weekIndex: { $gte: 0, $lte: 3 } } },
        { $group: { _id: '$weekIndex', count: { $sum: 1 } } },
      ]);

      weeklyData = [0, 0, 0, 0];
      weeklyAgg.forEach((row) => {
        const idx = 3 - row._id; // 3 (oldest) -> 0, 0 (newest) -> 3
        if (idx >= 0 && idx < 4) weeklyData[idx] = row.count;
      });

      const responseAgg = await StudentJob.aggregate([
        {
          $match: {
            jobId: { $in: jobIds },
            hasApplied: true,
            employerRespondedAt: { $ne: null },
            appliedAt: { $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            avgMs: { $avg: { $subtract: ['$employerRespondedAt', '$appliedAt'] } },
          },
        },
      ]);

      if (responseAgg.length > 0 && responseAgg[0].avgMs !== null && responseAgg[0].avgMs !== undefined) {
        avgResponseTimeDays = Math.round((responseAgg[0].avgMs / (1000 * 60 * 60 * 24)) * 10) / 10;
      }
    }

    const applicationRate = totalViews > 0
      ? Math.round(((totalApplications / totalViews) * 100) * 10) / 10
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalJobs,
        totalViews,
        totalApplications,
        applicationRate,
        avgResponseTimeDays,
        weeklyData,
        statusCounts,

        // Keep existing keys for compatibility
        activeJobs: jobStatusCounts.active || 0,
        filledJobs: jobStatusCounts.filled || 0,
        expiredJobs: jobStatusCounts.expired || 0,
        draftJobs: jobStatusCounts.draft || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching job statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// PUT /api/jobs/:id/applications/:applicationId/status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const employerId = req.user.userId;
    const jobId = req.params.id;
    const { applicationId } = req.params;
    const { status } = req.body || {};

    const allowed = ['interview', 'accepted', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(', ')}`,
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.employerId.toString() !== employerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this job posting.',
      });
    }

    const application = await StudentJob.findOne({
      _id: applicationId,
      jobId,
      hasApplied: true,
    }).populate('studentId', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found for this job',
      });
    }

    application.status = status;
    if (!application.employerRespondedAt && application.appliedAt) {
      application.employerRespondedAt = new Date();
    }
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        id: application._id,
        jobId: application.jobId,
        status: application.status,
        studentName: application.studentId?.name,
        studentEmail: application.studentId?.email,
      },
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message,
    });
  }
};

// PUT /api/jobs/:id/applications/:applicationId/viewed
exports.markApplicationViewed = async (req, res) => {
  try {
    const employerId = req.user.userId;
    const jobId = req.params.id;
    const { applicationId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.employerId.toString() !== employerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this job posting.',
      });
    }

    const application = await StudentJob.findOne({
      _id: applicationId,
      jobId,
      hasApplied: true,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found for this job',
      });
    }

    if (!application.resumePath) {
      return res.status(400).json({
        success: false,
        message: 'No CV attached for this application',
      });
    }

    if ((application.status || 'pending') === 'pending' || application.status === 'reviewed') {
      application.status = 'viewed';
      if (!application.employerRespondedAt && application.appliedAt) {
        application.employerRespondedAt = new Date();
      }
      await application.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Application marked as viewed',
      data: {
        id: application._id,
        jobId: application.jobId,
        status: application.status,
      },
    });
  } catch (error) {
    console.error('Error marking application viewed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark application viewed',
      error: error.message,
    });
  }
};