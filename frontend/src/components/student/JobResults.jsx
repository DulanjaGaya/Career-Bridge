import React from 'react';
import JobCardStudent from './JobCardStudent';
import Loader from '../common/Loader';
import Pagination from '../common/Pagination';
import EmptyState from '../common/EmptyState';
import { FiBriefcase } from 'react-icons/fi';

const JobResults = ({ 
  jobs, 
  savedJobs, 
  onSave, 
  onUnsave, 
  pagination, 
  currentPage, 
  onPageChange,
  isLoading,
  layout = 'list'
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs found"
        message="Try adjusting your search or filters to find more opportunities"
        icon={FiBriefcase}
      />
    );
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-slate-300">
          Found <span className="font-semibold">{pagination?.total || jobs.length}</span> internships
        </p>
      </div>

      <div className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {jobs.map((job) => (
          <JobCardStudent
            key={job._id}
            job={job}
            layout={layout}
            isSaved={savedJobs?.includes(job._id)}
            onSave={() => onSave(job._id)}
            onUnsave={() => onUnsave(job._id)}
          />
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.pages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default JobResults;