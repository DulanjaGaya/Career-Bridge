import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import JobDetails from '../../components/employer/JobDetails';
import Loader from '../../components/common/Loader';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useJob, useJobApplications, deleteJob, updateJob, updateApplicationStatus, markApplicationViewed } = useJobs();
  const { data: jobData, isLoading } = useJob(id);
  const { data: applicationsData, isLoading: isApplicationsLoading } = useJobApplications(id);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      await deleteJob(id);
      navigate('/employer/my-jobs');
    }
  };

  if (isLoading) return <Loader />;

  return (
    <JobDetails
      job={jobData?.data}
      applications={applicationsData?.data}
      applicationsLoading={isApplicationsLoading}
      onEdit={() => navigate(`/employer/edit-job/${id}`)}
      onDelete={handleDelete}
      onBack={() => navigate('/employer/my-jobs')}
	  onUpdateJobStatus={(status) => {
		  const multipart = new FormData();
		  multipart.append('status', status);
		  updateJob({ id, data: multipart });
	  }}
      onUpdateApplicationStatus={(applicationId, status) => updateApplicationStatus({ jobId: id, applicationId, status })}
      onMarkApplicationViewed={(applicationId) => markApplicationViewed({ jobId: id, applicationId })}
    />
  );
};

export default JobDetailsPage;