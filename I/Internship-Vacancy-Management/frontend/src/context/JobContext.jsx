import React, { createContext, useState, useContext } from 'react';
import { jobService } from '../services/jobService';

const JobContext = createContext();

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within JobProvider');
  }
  return context;
};

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async (params) => {
    setLoading(true);
    try {
      const data = await jobService.getActiveJobs(params);
      setJobs(data.data);
      return data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData) => {
    setLoading(true);
    try {
      const data = await jobService.createJob(jobData);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (id, jobData) => {
    setLoading(true);
    try {
      const data = await jobService.updateJob(id, jobData);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id) => {
    setLoading(true);
    try {
      const data = await jobService.deleteJob(id);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        loading,
        fetchJobs,
        createJob,
        updateJob,
        deleteJob
      }}
    >
      {children}
    </JobContext.Provider>
  );
};