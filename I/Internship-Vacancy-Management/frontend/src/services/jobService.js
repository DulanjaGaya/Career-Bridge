import api from './api';

export const jobService = {
  // Employer endpoints
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  getEmployerJobs: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    const queryParams = searchParams.toString();
    const response = await api.get(`/jobs/my-posts${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  getJobApplications: async (id) => {
    const response = await api.get(`/jobs/${id}/applications`);
    return response.data;
  },

  updateApplicationStatus: async ({ jobId, applicationId, status }) => {
    const response = await api.put(`/jobs/${jobId}/applications/${applicationId}/status`, { status });
    return response.data;
  },

  markApplicationViewed: async ({ jobId, applicationId }) => {
    const response = await api.put(`/jobs/${jobId}/applications/${applicationId}/viewed`);
    return response.data;
  },

  // Public single job for students
  getPublicJobById: async (id) => {
    const response = await api.get(`/jobs/active/${id}`);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  getJobStatistics: async () => {
    const response = await api.get('/jobs/statistics');
    return response.data;
  },

  // Student endpoints (public)
  getActiveJobs: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    const queryParams = searchParams.toString();
    const response = await api.get(`/jobs/active${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },
};