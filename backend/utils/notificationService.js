const Notification = require('../models/notification');
const User = require('../models/User');

const notifyStudentsAboutJob = async (job, senderId) => {
  const students = await User.find({ role: 'student' }).select('_id').lean();

  if (!students.length) {
    return { createdCount: 0 };
  }

  const notifications = students.map((student) => ({
    recipientId: student._id,
    senderId,
    type: 'job_posted',
    title: 'New job posted',
    message: `${job.jobTitle} at ${job.company} is now available.`,
    link: `/jobs/${job._id}`,
    data: {
      jobId: job._id,
    },
  }));

  const createdNotifications = await Notification.insertMany(notifications, { ordered: false });
  return { createdCount: createdNotifications.length };
};

const notifyEmployerAboutApplication = async ({ job, applicationId, studentId }) => {
  const student = await User.findById(studentId).select('name').lean();

  const notification = await Notification.create({
    recipientId: job.employerId,
    senderId: studentId,
    type: 'job_application',
    title: 'New job application',
    message: `${student?.name || 'A student'} applied for ${job.jobTitle}.`,
    link: `/employer/jobs/${job._id}`,
    data: {
      jobId: job._id,
      applicationId,
      studentId,
    },
  });

  return notification;
};

module.exports = {
  notifyStudentsAboutJob,
  notifyEmployerAboutApplication,
};