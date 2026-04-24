import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FiArrowLeft, FiEdit, FiTrash2, FiMapPin, FiCalendar, 
  FiBriefcase, FiUsers, FiEye, FiMail, FiLink, FiDownload 
} from 'react-icons/fi';
import { BACKEND_URL } from '../../services/api';

const JobDetails = ({ job, applications = [], applicationsLoading = false, onEdit, onDelete, onBack, onUpdateApplicationStatus, onMarkApplicationViewed, onUpdateJobStatus }) => {
  if (!job) return null;

  const posterSrc = job.posterUrl
    ? (/^https?:\/\//i.test(job.posterUrl)
        ? job.posterUrl
        : `${BACKEND_URL}${job.posterUrl.startsWith('/') ? '' : '/'}${job.posterUrl}`)
    : null;

  const statusColors = {
    active: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40',
    filled: 'bg-slate-800 text-slate-100 border border-slate-700',
    expired: 'bg-red-500/10 text-red-300 border border-red-500/40',
    draft: 'bg-amber-500/10 text-amber-300 border border-amber-500/40',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
      onClick={onBack}
      className="mb-6 flex items-center gap-2 text-slate-300 hover:text-white transition"
      >
      <FiArrowLeft />
      Back to Postings
      </button>

      {/* Header + Stat Cards */}
      <div className="mb-8 flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-primary-300 mb-2">
          Currently Hiring
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          {job.jobTitle}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-400">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
          <span className="flex items-center gap-2">
          <FiCalendar className="h-4 w-4" />
          <span>Posted {job.createdAt ? format(new Date(job.createdAt), 'MMM dd, yyyy') : '—'}</span>
          </span>
        </div>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800 transition"
        >
          <FiEdit className="h-4 w-4" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-full border border-red-600/60 bg-red-600/10 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-600/20 transition"
        >
          <FiTrash2 className="h-4 w-4" />
          Delete
        </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-card rounded-xl px-4 py-4 shadow-sm">
        <p className="text-xs text-slate-400 mb-1">Total Views</p>
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-semibold text-white">{job.views || 0}</p>
          <span className="text-[11px] text-emerald-400">+0 this week</span>
        </div>
        </div>
        <div className="bg-dark-card rounded-xl px-4 py-4 shadow-sm">
        <p className="text-xs text-slate-400 mb-1">Applications</p>
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-semibold text-white">{job.applicationsCount || 0}</p>
          <span className="text-[11px] text-emerald-400">+0 new today</span>
        </div>
        </div>
        <div className="bg-dark-card rounded-xl px-4 py-4 shadow-sm">
        <p className="text-xs text-slate-400 mb-1">Days to Deadline</p>
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-semibold text-white">
          {Math.max(
            0,
            Math.ceil(
            (new Date(job.applicationDeadline).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
            )
          )}
          </p>
          <span className="text-[11px] text-slate-500">
          {format(new Date(job.applicationDeadline), 'MMM dd, yyyy')}
          </span>
        </div>
        </div>
        <div className="bg-dark-card rounded-xl px-4 py-4 shadow-sm">
        <p className="text-xs text-slate-400 mb-1">Open Positions</p>
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-semibold text-white">{job.positionsAvailable || 0}</p>
          <span className="text-[11px] text-slate-500">{job.employmentType || 'Internship'}</span>
        </div>
        </div>
      </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: description and requirements */}
      <div className="lg:col-span-2 space-y-6">
        {posterSrc && (
          <div className="bg-dark-card rounded-xl shadow-sm p-4 md:p-5">
            <img
              src={posterSrc}
              alt={`${job.jobTitle} poster`}
              className="w-full h-auto max-h-96 object-contain rounded-xl border border-slate-800 bg-slate-950/40"
              loading="lazy"
            />
          </div>
        )}
        <div className="bg-dark-card rounded-xl shadow-sm p-6 md:p-7">
        <h2 className="text-lg md:text-xl font-semibold text-white mb-3">Job Description</h2>
        <p className="text-sm md:text-base text-slate-200 leading-relaxed whitespace-pre-wrap">
          {job.description}
        </p>
        </div>

        <div className="bg-dark-card rounded-xl shadow-sm p-6 md:p-7">
        <h2 className="text-lg md:text-xl font-semibold text-white mb-3">Key Requirements</h2>
        <p className="text-sm md:text-base text-slate-200 whitespace-pre-wrap">
          {job.requirements}
        </p>
        </div>

        {job.skills && job.skills.length > 0 && (
        <div className="bg-dark-card rounded-xl shadow-sm p-6 md:p-7">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-3">Key Skills</h2>
          <div className="flex flex-wrap gap-2">
          {job.skills.map((skill, index) => (
            <span
            key={index}
            className="px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-xs font-medium text-slate-100"
            >
            {skill}
            </span>
          ))}
          </div>
        </div>
        )}

        {/* Recent Applications */}
        <div id="applications" className="bg-dark-card rounded-xl shadow-sm p-6 md:p-7 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-white">Recent Applications</h2>
          {applications && applications.length > 0 && (
          <button className="text-xs font-medium text-primary-300 hover:text-primary-200">
            View All Pool
          </button>
          )}
        </div>

        {applicationsLoading && (
          <p className="text-slate-400 text-sm">Loading applications...</p>
        )}

        {!applicationsLoading && (!applications || applications.length === 0) && (
          <p className="text-slate-400 text-sm">No applications have been submitted for this job yet.</p>
        )}

        {!applicationsLoading && applications && applications.length > 0 && (
          <div className="space-y-4">
          {applications.map((app) => {
            const displayStatus = app.status === 'reviewed' ? 'viewed' : app.status;
            const isFinal = displayStatus === 'accepted' || displayStatus === 'rejected';
			const mailToHref = (() => {
				if (!app.studentEmail) return null;
				const subject = `Regarding your application for ${job.jobTitle}`;
				const body = `Hi ${app.studentName || ''},\n\n` +
					`Thanks for applying for the ${job.jobTitle} role at ${job.company}.\n\n` +
					`Best regards,\n${job.company}`;
				return `mailto:${encodeURIComponent(app.studentEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
			})();
            return (
            <div
            key={app.id}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3"
            >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-200">
              {(app.studentName || 'A')[0]}
              </div>
              <div>
              <p className="font-medium text-slate-50">
                {app.studentName || 'Unnamed Applicant'}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <FiMail className="h-3 w-3" />
                <span>{app.studentEmail || 'Email not available'}</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Applied {app.appliedAt ? format(new Date(app.appliedAt), 'MMM dd, yyyy') : 'N/A'}
              </p>
              {app.coverLetter && (
                <p className="mt-2 text-xs text-slate-200 line-clamp-2">
                {app.coverLetter}
                </p>
              )}
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-2">
              <div className="flex justify-start md:justify-end">
              <span className="px-3 py-1 text-[11px] rounded-full bg-slate-800 text-slate-100 border border-slate-700">
                {displayStatus || 'Applied'}
              </span>
              </div>

              {!isFinal && typeof onUpdateApplicationStatus === 'function' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-80">
                <button
                onClick={() => onUpdateApplicationStatus(app.id, 'interview')}
                className="h-8 w-full inline-flex items-center justify-center px-2.5 rounded-full bg-slate-900/70 border border-slate-700 text-[11px] font-medium text-slate-100 hover:bg-slate-800 transition"
                >
                Call for Interview
                </button>
                <button
                onClick={() => onUpdateApplicationStatus(app.id, 'accepted')}
                className="h-8 w-full inline-flex items-center justify-center px-2.5 rounded-full bg-primary-600 text-[11px] font-medium text-white hover:bg-primary-700 transition"
                >
                Accept
                </button>
                <button
                onClick={() => onUpdateApplicationStatus(app.id, 'rejected')}
                className="h-8 w-full inline-flex items-center justify-center px-2.5 rounded-full bg-red-600 text-[11px] font-medium text-white hover:bg-red-700 transition"
                >
                Reject
                </button>
              </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-80">
              {mailToHref ? (
                <a
                href={mailToHref}
                className="h-8 w-full inline-flex items-center justify-center gap-2 px-2.5 rounded-full bg-slate-900/70 border border-slate-700 text-[11px] font-medium text-slate-100 hover:bg-slate-800 transition"
                title="Email applicant"
                >
                <FiMail className="h-3 w-3" />
                Email Applicant
                </a>
              ) : (
                <span className="h-8 w-full inline-flex items-center justify-center px-2.5 rounded-full bg-slate-950/40 border border-slate-800 text-[11px] font-medium text-slate-500">
                No email
                </span>
              )}

              {app.resumeUrl ? (
                <button
                type="button"
                onClick={() => {
                  if (typeof onMarkApplicationViewed === 'function') {
                  onMarkApplicationViewed(app.id);
                  }
                  window.open(app.resumeUrl, '_blank', 'noopener,noreferrer');
                }}
                className="h-8 w-full inline-flex items-center justify-center gap-2 px-2.5 rounded-full bg-primary-600 text-[11px] font-medium text-white hover:bg-primary-700 transition"
                >
                <FiDownload className="h-3 w-3" />
                Download CV
                </button>
              ) : (
                <span className="h-8 w-full inline-flex items-center justify-center px-2.5 rounded-full bg-slate-950/40 border border-slate-800 text-[11px] font-medium text-slate-500">
                No CV
                </span>
              )}
              </div>
            </div>
            </div>
            );
          })}
          </div>
        )}
        </div>
      </div>

      {/* Right: job metadata & actions */}
      <div className="space-y-6">
        <div className="bg-dark-card rounded-xl shadow-sm p-6 md:p-7">
        <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-400 mb-4">
          Job Metadata
        </h3>
        <div className="space-y-4 text-sm text-slate-200">
          <div className="flex items-start gap-3">
          <span className="mt-0.5"><FiMapPin className="h-4 w-4 text-primary-400" /></span>
          <div>
            <p className="text-xs uppercase text-slate-500">Location</p>
            <p className="font-medium">
            {job.location?.city || 'Not specified'}
            {job.location?.isRemote && <span className="text-emerald-400 ml-1">(Hybrid/Remote)</span>}
            </p>
            {job.location?.address && (
            <p className="text-xs text-slate-500 mt-1">{job.location.address}</p>
            )}
          </div>
          </div>
          <div className="flex items-start gap-3">
          <span className="mt-0.5"><FiBriefcase className="h-4 w-4 text-primary-400" /></span>
          <div>
            <p className="text-xs uppercase text-slate-500">Experience Level</p>
            <p className="font-medium">{job.experienceLevel || 'Not specified'}</p>
          </div>
          </div>
          <div className="flex items-start gap-3">
          <span className="mt-0.5"><FiMail className="h-4 w-4 text-primary-400" /></span>
          <div>
            <p className="text-xs uppercase text-slate-500">Employment Type</p>
            <p className="font-medium">{job.employmentType || 'Internship'}</p>
          </div>
          </div>
          <div className="flex items-start gap-3">
          <span className="mt-0.5"><FiUsers className="h-4 w-4 text-primary-400" /></span>
          <div>
            <p className="text-xs uppercase text-slate-500">Open Positions</p>
            <p className="font-medium">{job.positionsAvailable || 0}</p>
          </div>
          </div>
          <div className="flex items-start gap-3">
          <span className="mt-0.5"><FiCalendar className="h-4 w-4 text-primary-400" /></span>
          <div>
            <p className="text-xs uppercase text-slate-500">Application Deadline</p>
            <p className="font-medium">{format(new Date(job.applicationDeadline), 'MMM dd, yyyy')}</p>
          </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {job.status === 'draft' && typeof onUpdateJobStatus === 'function' && (
          <button
            type="button"
            onClick={() => onUpdateJobStatus('active')}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
          >
            Publish Job
          </button>
          )}
          {job.status === 'active' && typeof onUpdateJobStatus === 'function' && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Mark this job as filled? Students will no longer be able to apply.')) {
                onUpdateJobStatus('filled');
              }
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900/70 border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition"
          >
            Mark as Filled
          </button>
          )}
          <button className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-5 py-2.5 text-sm text-slate-100 hover:bg-slate-800 transition">
          <FiLink className="h-4 w-4" />
          Copy Shareable Link
          </button>
        </div>
        </div>

        <div className="bg-slate-950 rounded-xl shadow-sm p-6 md:p-7 border border-slate-800">
        <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-400 mb-3">
          Company Snapshot
        </h3>
        <p className="text-sm text-slate-300">
          {job.company} is using this internship to grow emerging talent and support critical projects.
        </p>
        <Link
          to="#"
          className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary-300 hover:text-primary-200"
        >
          View firm profile
        </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default JobDetails;