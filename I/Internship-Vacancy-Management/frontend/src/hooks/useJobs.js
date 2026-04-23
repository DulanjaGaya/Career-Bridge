import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import toast from 'react-hot-toast';

export const useJobs = () => {
  const queryClient = useQueryClient();

  const useEmployerJobs = (params) => {
    return useQuery({
      queryKey: ['employerJobs', params],
      queryFn: () => jobService.getEmployerJobs(params),
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
    });
  };

  const useActiveJobs = (params) => {
    return useQuery({
      queryKey: ['activeJobs', params],
      queryFn: () => jobService.getActiveJobs(params),
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
    });
  };

  const useJob = (id) => {
    return useQuery({
      queryKey: ['job', id],
      queryFn: () => jobService.getJobById(id),
      enabled: !!id,
    });
  };

  const useJobApplications = (id) => {
    return useQuery({
      queryKey: ['jobApplications', id],
      queryFn: () => jobService.getJobApplications(id),
      enabled: !!id,
    });
  };

  const usePublicJob = (id) => {
    return useQuery({
      queryKey: ['publicJob', id],
      queryFn: () => jobService.getPublicJobById(id),
      enabled: !!id,
    });
  };

  const createJobMutation = useMutation({
    mutationFn: jobService.createJob,
    onSuccess: (data) => {
      toast.success(data.message || 'Job created successfully');
      queryClient.invalidateQueries({ queryKey: ['employerJobs'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create job');
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => jobService.updateJob(id, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Job updated successfully');
      queryClient.invalidateQueries({ queryKey: ['employerJobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', data.data._id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update job');
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: jobService.deleteJob,
    onSuccess: (data) => {
      toast.success(data.message || 'Job deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['employerJobs'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    },
  });

  const updateApplicationStatusMutation = useMutation({
    mutationFn: jobService.updateApplicationStatus,
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Application status updated');
      queryClient.invalidateQueries({ queryKey: ['jobApplications', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update application status');
    },
  });

  const markApplicationViewedMutation = useMutation({
    mutationFn: jobService.markApplicationViewed,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications', variables.jobId] });
    },
  });

  const useStatistics = () => {
    return useQuery({
      queryKey: ['jobStatistics'],
      queryFn: jobService.getJobStatistics,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
    });
  };

  return {
    useEmployerJobs,
    useActiveJobs,
    useJob,
    useJobApplications,
    usePublicJob,
    createJob: createJobMutation.mutate,
    updateJob: updateJobMutation.mutate,
    deleteJob: deleteJobMutation.mutate,
    updateApplicationStatus: updateApplicationStatusMutation.mutate,
    markApplicationViewed: markApplicationViewedMutation.mutate,
    useStatistics,
    isCreating: createJobMutation.isPending,
    isUpdating: updateJobMutation.isPending,
    isDeleting: deleteJobMutation.isPending,
    isUpdatingApplicationStatus: updateApplicationStatusMutation.isPending,
    isMarkingApplicationViewed: markApplicationViewedMutation.isPending,
  };
};