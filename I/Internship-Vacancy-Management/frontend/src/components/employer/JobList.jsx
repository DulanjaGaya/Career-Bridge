import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import JobCard from './JobCard';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const JobList = () => {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightJobId, setHighlightJobId] = useState(null);
  const location = useLocation();
  const { useEmployerJobs, deleteJob } = useJobs();
  const { data, isLoading } = useEmployerJobs({ 
    status: status !== 'all' ? status : undefined, 
    page, 
    limit: 10,
    search: searchTerm || undefined
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      await deleteJob(id);
    }
  };

  useEffect(() => {
    const jobIdFromState = location.state?.highlightJobId;
    if (!jobIdFromState) return;

    setHighlightJobId(jobIdFromState);

    const timer = setTimeout(() => {
      setHighlightJobId(null);
    }, 10000);

    return () => clearTimeout(timer);
  }, [location.state?.highlightJobId]);

  const filteredJobs = data?.data?.filter(job => 
    job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Job Posts</h1>
        <p className="text-slate-300 mt-2">Manage and track your internship listings</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-dark-card rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <FiFilter className="text-slate-500 self-center" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Jobs</option>
              <option value="active">Active</option>
              <option value="filled">Filled</option>
              <option value="expired">Expired</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs?.length === 0 ? (
        <EmptyState
          title="No jobs found"
          message="You haven't posted any internships yet. Create your first job posting now!"
          actionText="Post a Job"
          actionLink="/employer/create-job"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs?.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onDelete={handleDelete}
                isHighlighted={job._id === highlightJobId}
              />
            ))}
          </div>

          {data?.pagination && data.pagination.pages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.pagination.pages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default JobList;