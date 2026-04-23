import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudent } from '../../hooks/useStudent';
import { FiBookmark, FiTrash2, FiCalendar, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';

const SavedJobs = () => {
  const [page, setPage] = useState(1);
  const { useSavedJobs, unsaveJob } = useStudent();
  const { data, isLoading, refetch } = useSavedJobs({ page, limit: 10 });

  const handleUnsave = async (jobId, jobTitle) => {
    try {
      await unsaveJob(jobId);
      toast.success(`Removed ${jobTitle} from saved jobs`);
      refetch();
    } catch (error) {
      toast.error('Failed to remove job');
    }
  };

  if (isLoading) return <Loader />;

  if (!data?.data || data.data.length === 0) {
    return (
      <EmptyState
        title="No saved jobs"
        message="Save interesting internships to apply later"
        actionText="Browse Jobs"
        actionLink="/browse-jobs"
        icon={FiBookmark}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Saved Jobs</h1>
        <p className="text-slate-300 mt-2">Jobs you've saved for later</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {data.data.map((job) => (
          <div key={job._id} className="bg-dark-card rounded-lg shadow-md hover:shadow-lg transition p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <Link to={`/jobs/${job._id}`} className="block">
                  <h2 className="text-xl font-semibold text-white hover:text-primary-600">
                    {job.jobTitle}
                  </h2>
                </Link>
                <p className="text-slate-300 mt-1">{job.company}</p>
                
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <FiMapPin className="h-4 w-4" />
                    <span>{job.location?.city}</span>
                    {job.location?.isRemote && <span className="text-green-600 ml-1">(Remote)</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <FiCalendar className="h-4 w-4" />
                    <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
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
              </div>

              <div className="flex flex-row md:flex-col gap-2">
                <Link
                  to={`/jobs/${job._id}`}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm text-center"
                >
                  Apply Now
                </Link>
                <button
                  onClick={() => handleUnsave(job._id, job.jobTitle)}
                  className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition text-sm flex items-center justify-center gap-1"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data?.pagination && data.pagination.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.pagination.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default SavedJobs;