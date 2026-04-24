import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import JobForm from '../../components/employer/JobForm';

const CreateJob = () => {
  const navigate = useNavigate();
  const { createJob, isCreating } = useJobs();

  const handleSubmit = async (data) => {
    await createJob(data);
    navigate('/employer/my-jobs');
  };

  return (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div className="mb-10">
    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary-300 mb-3">Recruitment Suite</p>
    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
      Architect Your
      <span className="block text-primary-300">Perfect Intern Team.</span>
    </h1>
    <p className="text-slate-300 mt-3 max-w-2xl text-sm md:text-base">
      Transform educational potential into professional excellence by listing high-impact internship opportunities for the next generation of talent.
    </p>
    </div>
    <JobForm onSubmit={handleSubmit} isLoading={isCreating} />
  </div>
  );
};

export default CreateJob;