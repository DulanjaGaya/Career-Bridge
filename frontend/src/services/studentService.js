import api from './api';

export const studentService = {
  // Apply for a job
  applyForJob: async (jobId, applicationData) => {
    const response = await api.post(`/students/jobs/${jobId}/apply`, applicationData);
    return response.data;
  },

  // Get applied jobs
  getAppliedJobs: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    const queryParams = searchParams.toString();
    const response = await api.get(`/students/applied-jobs${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  // Update an application (pending only)
  updateApplication: async (applicationId, data) => {
    const response = await api.put(`/students/applications/${applicationId}`, data);
    return response.data;
  },

  // Delete an application (pending only)
  deleteApplication: async (applicationId) => {
    const response = await api.delete(`/students/applications/${applicationId}`);
    return response.data;
  },

  // Save a job
  saveJob: async (jobId) => {
    const response = await api.post(`/students/jobs/${jobId}/save`);
    return response.data;
  },

  // Unsave a job
  unsaveJob: async (jobId) => {
    const response = await api.delete(`/students/jobs/${jobId}/save`);
    return response.data;
  },

  // Get saved jobs
  getSavedJobs: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    const queryParams = searchParams.toString();
    const response = await api.get(`/students/saved-jobs${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  // Update student profile
  updateProfile: async (profileData) => {
    const response = await api.put('/students/profile', profileData);
    return response.data;
  },

  // Get student profile
  getProfile: async () => {
    const response = await api.get('/students/profile');
    return response.data;
  },

  // Get application statistics
  getApplicationStats: async () => {
    const response = await api.get('/students/statistics');
    return response.data;
  },
};