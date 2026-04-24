import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../services/studentService';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

export const useStudent = () => {
  const queryClient = useQueryClient();
  const currentUser = authService.getCurrentUser();
  const canUseStudentApis = currentUser?.role === 'student';

  const useAppliedJobs = (params) => {
    return useQuery({
      queryKey: ['appliedJobs', params],
      queryFn: () => studentService.getAppliedJobs(params),
      enabled: canUseStudentApis,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
    });
  };

  const useSavedJobs = (params) => {
    return useQuery({
      queryKey: ['savedJobs', params],
      queryFn: () => studentService.getSavedJobs(params),
      enabled: canUseStudentApis,
      staleTime: 5 * 60 * 1000,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
    });
  };

  const useProfile = () => {
    return useQuery({
      queryKey: ['studentProfile'],
      queryFn: studentService.getProfile,
      enabled: canUseStudentApis,
      staleTime: 10 * 60 * 1000,
    });
  };

  const useApplicationStats = () => {
    return useQuery({
      queryKey: ['applicationStats'],
      queryFn: studentService.getApplicationStats,
      enabled: canUseStudentApis,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
    });
  };

  const applyJobMutation = useMutation({
    mutationFn: ({ jobId, data }) => studentService.applyForJob(jobId, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Application submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to apply for job');
    },
  });

  const saveJobMutation = useMutation({
    mutationFn: studentService.saveJob,
    onSuccess: (data) => {
      toast.success(data.message || 'Job saved successfully');
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save job');
    },
  });

  const unsaveJobMutation = useMutation({
    mutationFn: studentService.unsaveJob,
    onSuccess: (data) => {
      toast.success(data.message || 'Job removed from saved');
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove job');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: studentService.updateProfile,
    onSuccess: (data) => {
      toast.success(data.message || 'Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.studentProfile = data.data;
      localStorage.setItem('user', JSON.stringify(user));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({ applicationId, data }) => studentService.updateApplication(applicationId, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Application updated');
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] });
      queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update application');
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: (applicationId) => studentService.deleteApplication(applicationId),
    onSuccess: (data) => {
      toast.success(data.message || 'Application deleted');
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] });
      queryClient.invalidateQueries({ queryKey: ['applicationStats'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete application');
    },
  });

  return {
    useAppliedJobs,
    useSavedJobs,
    useProfile,
    useApplicationStats,
    applyForJob: applyJobMutation.mutate,
    saveJob: saveJobMutation.mutate,
    unsaveJob: unsaveJobMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    updateApplication: updateApplicationMutation.mutate,
    deleteApplication: deleteApplicationMutation.mutate,
    isApplying: applyJobMutation.isPending,
    isSaving: saveJobMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingApplication: updateApplicationMutation.isPending,
    isDeletingApplication: deleteApplicationMutation.isPending,
  };
};