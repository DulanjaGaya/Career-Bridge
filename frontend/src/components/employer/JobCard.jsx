import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FiEye, FiUsers, FiEdit, FiTrash2, FiMapPin, 
  FiClock, FiCalendar, FiTrendingUp 
} from 'react-icons/fi';

const JobCard = ({ job, onDelete, isHighlighted = false }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    filled: 'bg-dark-base text-slate-100',
    expired: 'bg-red-100 text-red-800',
    draft: 'bg-yellow-100 text-yellow-800',
  };

  const statusText = {
    active: 'Active',
    filled: 'Filled',
    expired: 'Expired',
    draft: 'Draft',
  };

  const isExpired = new Date(job.applicationDeadline) < new Date();

  return (
    <div
      className={`bg-dark-card rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2 ${
        isHighlighted
          ? 'border-primary-500 ring-2 ring-primary-300 animate-pulse'
          : 'border-transparent'
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                {statusText[job.status]}
              </span>
              {isHighlighted && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 opacity-80">
                  Updated
                </span>
              )}
              {isExpired && job.status === 'active' && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Expiring Soon
                </span>
              )}
            </div>
            <Link to={`/employer/jobs/${job._id}`}>
              <h2 className="text-xl font-semibold text-white hover:text-primary-600 transition">
                {job.jobTitle}
              </h2>
            </Link>
            <p className="text-slate-300 mt-1">{job.company}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/employer/edit-job/${job._id}`}
              className="p-2 text-slate-300 hover:text-primary-600 rounded-full hover:bg-dark-base transition"
              title="Edit Job"
            >
              <FiEdit className="h-5 w-5" />
            </Link>
            <button
              onClick={() => onDelete(job._id)}
              className="p-2 text-slate-300 hover:text-red-600 rounded-full hover:bg-dark-base transition"
              title="Delete Job"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <FiMapPin className="h-4 w-4" />
            <span>{job.location?.city}</span>
            {job.location?.isRemote && <span className="text-green-600">(Remote)</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <FiCalendar className="h-4 w-4" />
            <span>Deadline: {format(new Date(job.applicationDeadline), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <FiEye className="h-4 w-4" />
            <span>{job.views || 0} views</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <FiUsers className="h-4 w-4" />
            <span>{job.applicationsCount || 0} applications</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills?.slice(0, 5).map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-dark-base text-slate-300 text-xs rounded">
              {skill}
            </span>
          ))}
          {job.skills?.length > 5 && (
            <span className="px-2 py-1 bg-dark-base text-slate-300 text-xs rounded">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-slate-400">
            Posted: {format(new Date(job.createdAt), 'MMM dd, yyyy')}
          </div>
          <Link
            to={`/employer/jobs/${job._id}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            View Details
            <FiTrendingUp className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;