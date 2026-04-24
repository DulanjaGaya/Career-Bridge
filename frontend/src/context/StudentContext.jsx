import React, { createContext, useState, useContext } from 'react';
import { studentService } from '../services/studentService';

const StudentContext = createContext();

export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudentContext must be used within StudentProvider');
  }
  return context;
};

export const StudentProvider = ({ children }) => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAppliedJobs = async () => {
    setLoading(true);
    try {
      const data = await studentService.getAppliedJobs();
      setAppliedJobs(data.data);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const data = await studentService.getSavedJobs();
      setSavedJobs(data.data);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyForJob = async (jobId, coverLetter) => {
    setLoading(true);
    try {
      const data = await studentService.applyForJob(jobId, { coverLetter });
      await fetchAppliedJobs();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveJob = async (jobId) => {
    try {
      const data = await studentService.saveJob(jobId);
      await fetchSavedJobs();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const unsaveJob = async (jobId) => {
    try {
      const data = await studentService.unsaveJob(jobId);
      await fetchSavedJobs();
      return data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <StudentContext.Provider
      value={{
        appliedJobs,
        savedJobs,
        loading,
        fetchAppliedJobs,
        fetchSavedJobs,
        applyForJob,
        saveJob,
        unsaveJob
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};