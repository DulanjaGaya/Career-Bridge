import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import JobForm from '../../components/employer/JobForm';
import Loader from '../../components/common/Loader';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useJob, updateJob, isUpdating } = useJobs();
  const { data: jobData, isLoading } = useJob(id);

  if (isLoading) return <Loader />;

  const handleSubmit = async (data) => {
    await updateJob({ id, data });
    navigate('/employer/my-jobs', { state: { highlightJobId: id } });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Internship</h1>
        <p className="text-slate-300 mt-2">Update the job details below</p>
      </div>
      <div className="bg-dark-card rounded-xl shadow-md p-6">
        <JobForm
	      initialValues={jobData?.data}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
        />
      </div>
    </div>
  );
};

export default EditJob;