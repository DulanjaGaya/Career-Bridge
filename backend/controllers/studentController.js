const Job = require('../models/job');
const User = require('../models/user');
const StudentJob = require('../models/studentJob');
const path = require('path');
const fs = require('fs');

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

const resumeStoredPathFromFile = (file) => {
  if (!file) return undefined;
  // Always store as a workspace-relative path so URLs work cross-platform
  const fileName = file.filename || path.basename(file.path || '');
  return `uploads/resumes/${fileName}`;
};

// Helper to get or create StudentJob doc
const getOrCreateStudentJob = async (studentId, jobId) => {
  let record = await StudentJob.findOne({ studentId, jobId });
  if (!record) {
    record = await StudentJob.create({ studentId, jobId });
  }
  return record;
};

// POST /api/students/jobs/:jobId/apply
exports.applyForJob = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { jobId } = req.params;
    const { coverLetter } = req.body || {};
    const resumePath = resumeStoredPathFromFile(req.file);

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.status !== 'active' || job.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Applications are closed for this job',
      });
    }

    const record = await getOrCreateStudentJob(studentId, jobId);
    if (record.hasApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    record.hasApplied = true;
    record.status = 'pending';
    record.employerRespondedAt = null;
    record.coverLetter = coverLetter || record.coverLetter;
    if (resumePath) {
      record.resumePath = resumePath;
    }
    record.appliedAt = new Date();
    await record.save();

    // Increment applicationsCount on the job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: record._id,
        jobId: record.jobId,
        appliedAt: record.appliedAt,
        status: record.status,
        resumeUrl: resumeUrlFromPath(req, record.resumePath),
      },
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to apply for job',
      error: error.message,
    });
  }
};

// GET /api/students/applied-jobs
exports.getAppliedJobs = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const { status, page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const query = { studentId, hasApplied: true };
    if (status) {
      if (status === 'viewed') {
        query.status = { $in: ['viewed', 'reviewed'] };
      } else {
        query.status = status;
      }
    }

    const total = await StudentJob.countDocuments(query);

    const records = await StudentJob.find(query)
      .sort({ appliedAt: -1 })
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .populate('jobId');

    const applications = records
      .filter((r) => r.jobId)
      .map((r) => ({
        _id: r._id,
        jobId: r.jobId._id,
        jobTitle: r.jobId.jobTitle,
        company: r.jobId.company,
        appliedDate: r.appliedAt,
        status: r.status || 'pending',
        location: r.jobId.location,
        specialization: r.jobId.specialization,
        coverLetter: r.coverLetter,
        resumeUrl: resumeUrlFromPath(req, r.resumePath),
      }));

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applied jobs',
      error: error.message,
    });
  }
};

// PUT /api/students/applications/:applicationId (pending only)
exports.updateApplication = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { applicationId } = req.params;
    const { coverLetter } = req.body || {};
    const resumePath = resumeStoredPathFromFile(req.file);

    const record = await StudentJob.findOne({ _id: applicationId, studentId, hasApplied: true });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if ((record.status || 'pending') !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'You can only edit an application while its status is pending',
      });
    }

    if (coverLetter !== undefined) {
      record.coverLetter = coverLetter;
    }
    if (resumePath) {
      record.resumePath = resumePath;
    }

    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: {
        id: record._id,
        status: record.status,
        coverLetter: record.coverLetter,
        resumeUrl: resumeUrlFromPath(req, record.resumePath),
      },
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message,
    });
  }
};

// DELETE /api/students/applications/:applicationId (pending only)
exports.deleteApplication = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { applicationId } = req.params;

    const record = await StudentJob.findOne({ _id: applicationId, studentId, hasApplied: true });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if ((record.status || 'pending') !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'You can only delete an application while its status is pending',
      });
    }

    // decrement applicationsCount on the job (best-effort)
    if (record.jobId) {
      await Job.findByIdAndUpdate(record.jobId, { $inc: { applicationsCount: -1 } });
    }

    // best-effort delete resume file
    const storedResumePath = normalizeStoredUploadPath(record.resumePath);
    if (storedResumePath) {
      const absolute = path.join(__dirname, '..', storedResumePath);
      fs.promises.unlink(absolute).catch(() => {});
    }

    if (record.isSaved) {
      record.hasApplied = false;
      record.appliedAt = null;
      record.coverLetter = null;
      record.resumePath = null;
      record.status = 'pending';
      record.employerRespondedAt = null;
      await record.save();
    } else {
      await StudentJob.deleteOne({ _id: record._id });
    }

    return res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message,
    });
  }
};

// POST /api/students/jobs/:jobId/save
exports.saveJob = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    const record = await getOrCreateStudentJob(studentId, jobId);
    record.isSaved = true;
    record.savedAt = new Date();
    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Job saved successfully',
    });
  } catch (error) {
    console.error('Error saving job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save job',
      error: error.message,
    });
  }
};

// DELETE /api/students/jobs/:jobId/save
exports.unsaveJob = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { jobId } = req.params;

    const record = await StudentJob.findOne({ studentId, jobId });
    if (!record || !record.isSaved) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found',
      });
    }

    record.isSaved = false;
    record.savedAt = null;

    // If there is no application either, remove the document
    if (!record.hasApplied) {
      await StudentJob.deleteOne({ _id: record._id });
    } else {
      await record.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Job removed from saved',
    });
  } catch (error) {
    console.error('Error unsaving job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove job from saved',
      error: error.message,
    });
  }
};

// GET /api/students/saved-jobs
exports.getSavedJobs = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const records = await StudentJob.find({ studentId, isSaved: true })
      .sort({ savedAt: -1 })
      .populate('jobId');

    const jobs = records
      .filter((r) => r.jobId)
      .map((r) => r.jobId);

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch saved jobs',
      error: error.message,
    });
  }
};

// PUT /api/students/profile
exports.updateProfile = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const profileData = req.body || {};

    const allowedFields = [
      'university',
      'degree',
      'graduationYear',
      'skills',
      'resume',
      'portfolio',
      'phone',
      'location',
      'profilePicture',
    ];

    const update = {};
    allowedFields.forEach((field) => {
      if (profileData[field] !== undefined) {
        update[`studentProfile.${field}`] = profileData[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      studentId,
      { $set: update },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user.studentProfile || {},
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// GET /api/students/profile
exports.getProfile = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const user = await User.findById(studentId).select('studentProfile');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user.studentProfile || {},
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

// GET /api/students/statistics
exports.getApplicationStats = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const applications = await StudentJob.find({ studentId, hasApplied: true });
    const savedJobs = await StudentJob.countDocuments({ studentId, isSaved: true });

    const now = new Date();

    const totalApplications = applications.length;
    const thisMonthApplications = applications.filter((a) => {
      if (!a.appliedAt) return false;
      return (
        a.appliedAt.getMonth() === now.getMonth() &&
        a.appliedAt.getFullYear() === now.getFullYear()
      );
    }).length;

    const statusCounts = {
      pending: 0,
      viewed: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
    };

    applications.forEach((a) => {
      const raw = a.status || 'pending';
      const key = raw === 'reviewed' ? 'viewed' : raw;
      if (statusCounts[key] !== undefined) statusCounts[key] += 1;
    });

    // Simple monthlyApplications array (last 6 months) and corresponding month labels
    const monthlyApplications = new Array(6).fill(0);
    const monthLabels = [];
    applications.forEach((a) => {
      if (!a.appliedAt) return;
      const diffMonths =
        (now.getFullYear() - a.appliedAt.getFullYear()) * 12 +
        (now.getMonth() - a.appliedAt.getMonth());
      if (diffMonths >= 0 && diffMonths < 6) {
        const index = 5 - diffMonths; // newest month at end
        monthlyApplications[index] += 1;
      }
    });

    // Build month labels aligned with monthlyApplications (oldest to newest)
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      monthLabels.push(label);
    }

    return res.status(200).json({
      success: true,
      data: {
        totalApplications,
        thisMonthApplications,
        savedJobs,
        interviews: statusCounts.interview,
        profileViews: 0, // placeholder
        monthlyApplications,
        monthLabels,
        statusCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics',
      error: error.message,
    });
  }
};
