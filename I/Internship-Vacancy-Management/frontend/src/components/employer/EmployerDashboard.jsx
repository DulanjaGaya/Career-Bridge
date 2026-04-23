import React from 'react';
import JobStats from './JobStats';
import JobList from './JobList';
import { useJobs } from '../../hooks/useJobs';
import Loader from '../common/Loader';

const EmployerDashboard = () => {
  const { useStatistics } = useJobs();
  const { data, isLoading } = useStatistics();

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <Loader />
      </div>
    );
  }

  const stats = data?.data;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <JobStats stats={stats} />
      <JobList />
    </div>
  );
};

export default EmployerDashboard;
