import React, { createContext, useState, useContext } from 'react';
import { studentService } from '../services/studentService';
import { authService } from '../services/authService';

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
  const currentUser = authService.getCurrentUser();
  const canUseStudentApis = currentUser?.role === 'student';

  const fetchAppliedJobs = async () => {
    if (!canUseStudentApis) return;
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
    if (!canUseStudentApis) return;
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
    if (!canUseStudentApis) {
      throw new Error('Student account required');
    }
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
    if (!canUseStudentApis) {
      throw new Error('Student account required');
    }
    try {
      const data = await studentService.saveJob(jobId);
      await fetchSavedJobs();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const unsaveJob = async (jobId) => {
    if (!canUseStudentApis) {
      throw new Error('Student account required');
    }
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