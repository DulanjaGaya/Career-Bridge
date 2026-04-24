import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FiMapPin, FiCalendar, FiBriefcase, FiBookmark, FiClock } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { BACKEND_URL } from '../../services/api';

const JobCardStudent = ({ job, isSaved, onSave, onUnsave, layout = 'list' }) => {
  const { user } = useAuth();
  const isExpired = new Date(job.applicationDeadline) < new Date();
  const posterSrc = job.posterUrl
    ? (/^https?:\/\//i.test(job.posterUrl)
        ? job.posterUrl
        : `${BACKEND_URL}${job.posterUrl.startsWith('/') ? '' : '/'}${job.posterUrl}`)
    : null;

  if (layout === 'grid') {
    return (
      <div className="bg-dark-card rounded-2xl p-6 flex flex-col justify-between gap-6 hover:shadow-2xl transition-all duration-300 border border-slate-800/60 hover:border-primary-500/30 group h-full">
        <div>
          {posterSrc && (
            <Link to={`/jobs/${job._id}`} className="block mb-4">
              <img
                src={posterSrc}
                alt={`${job.jobTitle} poster`}
                className="w-full h-auto max-h-44 object-contain rounded-xl border border-slate-800 bg-slate-950/40"
                loading="lazy"
              />
            </Link>
          )}
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg border border-primary-500/20 bg-primary-900/10 text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300 shadow-inner">
              {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
            </div>
            {user?.role !== 'employer' && (
              <button
                onClick={isSaved ? onUnsave : onSave}
                className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full border transition-all ${
                  isSaved 
                    ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' 
                    : 'border-slate-700/50 bg-dark-base text-slate-400 hover:text-white hover:border-slate-600'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save job'}
              >
                <FiBookmark className={`w-4 h-4 ${isSaved ? "fill-yellow-500" : ""}`} />
              </button>
            )}
          </div>
          
          <Link to={`/jobs/${job._id}`} className="text-xl font-bold text-white hover:text-primary-500 transition-colors block mb-1">
            {job.jobTitle}
          </Link>
          <div className="text-slate-400 text-sm font-medium mb-4">
            <span className="text-slate-300">{job.company}</span>
          </div>
          
          <div className="flex flex-col gap-2 text-xs text-slate-500 font-medium mb-4">
            <span className="flex items-center gap-2"><FiMapPin className="w-3.5 h-3.5" /> {job.location?.city || 'Remote'} {job.location?.isRemote && <span className="text-green-500">(Remote)</span>}</span>
            <span className="flex items-center gap-2"><FiBriefcase className="w-3.5 h-3.5" /> {job.experienceLevel}</span>
            <span className="flex items-center gap-2"><FiClock className="w-3.5 h-3.5" /> Deadline: {format(new Date(job.applicationDeadline), 'MMM dd')}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills?.slice(0, 3).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-dark-base text-slate-300 text-xs rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
          <div className="text-xs text-slate-400">
            {job.positionsAvailable} Position(s)
          </div>
          {user?.role !== 'employer' && (
            isExpired ? (
              <span className="text-red-500 text-xs font-bold px-3 py-1 bg-red-900/20 rounded">EXPIRED</span>
            ) : (
              <Link
                to={`/jobs/${job._id}`}
                className="px-5 py-2 bg-primary-600/10 text-primary-500 hover:bg-primary-600 hover:text-white font-semibold rounded-full transition-all text-xs text-center"
              >
                Apply
              </Link>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300 border border-slate-800/60 hover:border-primary-500/30 group">
      
      {/* Left side: Logo & Info */}
      <div className="flex items-center gap-5 flex-1">
        {posterSrc ? (
          <Link to={`/jobs/${job._id}`} className="block flex-shrink-0">
            <img
              src={posterSrc}
              alt={`${job.jobTitle} poster`}
              className="w-14 h-auto max-h-14 rounded-xl object-contain border border-slate-800 bg-slate-950/40"
              loading="lazy"
            />
          </Link>
        ) : (
          <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xl border border-primary-500/20 bg-primary-900/10 text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300 shadow-inner">
            {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
          </div>
        )}
        
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
             <Link to={`/jobs/${job._id}`} className="text-xl font-bold text-white hover:text-primary-500 transition-colors">
               {job.jobTitle}
             </Link>
             {isExpired && <span className="px-2 py-0.5 bg-red-900/40 text-red-500 text-xs font-bold rounded">EXPIRED</span>}
          </div>
          
          <div className="text-slate-400 text-sm font-medium mb-2">
             <span className="text-slate-300">{job.company}</span> <span className="mx-1.5 opacity-50">•</span> 
             {job.location?.city || 'Remote'} {job.location?.isRemote ? <span className="text-green-500 ml-1 text-xs px-1.5 py-0.5 bg-green-900/20 rounded">(Remote)</span> : ''}
          </div>
          
          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 font-medium">
             <span className="flex items-center gap-1.5"><FiClock className="w-3.5 h-3.5" /> Deadline: {format(new Date(job.applicationDeadline), 'MMM dd')}</span>
             <span className="flex items-center gap-1.5"><FiBriefcase className="w-3.5 h-3.5" /> {job.experienceLevel}</span>
             <span className="flex items-center gap-1.5"><FiMapPin className="w-3.5 h-3.5" /> {job.positionsAvailable} Position(s)</span>
          </div>
        </div>
      </div>
      
      {/* Right side: Actions */}
      <div className="flex items-center justify-end gap-3 mt-4 md:mt-0 w-full md:w-auto">
        {user?.role !== 'employer' && (
          <>
             <Link
               to={`/jobs/${job._id}`}
               className="flex-1 md:flex-none px-6 py-2.5 bg-dark-base border border-slate-700/50 text-white font-semibold rounded-full hover:bg-slate-800 hover:border-slate-600 transition-all text-sm text-center"
             >
               View Details
             </Link>
             <button
               onClick={isSaved ? onUnsave : onSave}
               className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full border transition-all ${
                 isSaved 
                   ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' 
                   : 'border-slate-700/50 bg-dark-base text-slate-400 hover:text-white hover:border-slate-600'
               }`}
               title={isSaved ? 'Remove from saved' : 'Save job'}
             >
               <FiBookmark className={`w-4 h-4 ${isSaved ? "fill-yellow-500" : ""}`} />
             </button>
          </>
        )}
      </div>

    </div>
  );
};

export default JobCardStudent;