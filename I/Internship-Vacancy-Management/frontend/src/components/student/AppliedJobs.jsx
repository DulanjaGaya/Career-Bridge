import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudent } from '../../hooks/useStudent';
import { FiEye } from 'react-icons/fi';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';

const AppliedJobs = () => {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editCoverLetter, setEditCoverLetter] = useState('');
  const [editResumeFile, setEditResumeFile] = useState(null);

  const {
    useAppliedJobs,
    updateApplication,
    deleteApplication,
    isUpdatingApplication,
    isDeletingApplication,
  } = useStudent();
  const { data, isLoading } = useAppliedJobs({ status: status !== 'all' ? status : undefined, page, limit: 10 });

  const applications = useMemo(() => (data?.data || []).map((a) => ({
    ...a,
    status: a.status === 'reviewed' ? 'viewed' : a.status,
  })), [data]);

  if (isLoading) return <Loader />;

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      viewed: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-blue-100 text-blue-800',
      interview: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-dark-base text-slate-100';
  };

  const getStatusIcon = (status) => {
    if (status === 'interview') return <FiEye className="inline mr-1" />;
    return null;
  };

  const startEdit = (application) => {
    setEditingId(application._id);
    setEditCoverLetter(application.coverLetter || '');
    setEditResumeFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCoverLetter('');
    setEditResumeFile(null);
  };

  const saveEdit = (applicationId) => {
    const formData = new FormData();
    formData.append('coverLetter', editCoverLetter);
    if (editResumeFile) {
      formData.append('resume', editResumeFile);
    }
    updateApplication(
      { applicationId, data: formData },
      {
        onSuccess: () => {
          cancelEdit();
        },
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Applications</h1>
        <p className="text-slate-300 mt-2">Track and manage your internship applications</p>
      </div>

      {/* Status Filter */}
      <div className="bg-dark-card rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'viewed', 'interview', 'accepted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                status === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-base text-slate-200 hover:bg-dark-card'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <EmptyState
          title="No applications found"
          message="You haven't applied for any internships yet. Start exploring opportunities!"
          actionText="Browse Jobs"
          actionLink="/browse-jobs"
        />
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application._id} className="bg-dark-card rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <Link to={`/jobs/${application.jobId}`} className="block">
                    <h2 className="text-xl font-semibold text-white hover:text-primary-600">
                      {application.jobTitle}
                    </h2>
                  </Link>
                  <p className="text-slate-300 mt-1">{application.company}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                    <span>{application.location?.city}</span>
                    <span>•</span>
                    <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                  </div>
                  {editingId === application._id ? (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-lg bg-dark-base border border-slate-700 p-3 text-sm text-slate-200">
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="text-slate-200 font-medium">{application.jobTitle}</span>
                          <span>•</span>
                          <span>{application.company}</span>
                          <span>•</span>
                          <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">Status: {application.status}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Cover letter</label>
                        <textarea
                          value={editCoverLetter}
                          onChange={(e) => setEditCoverLetter(e.target.value)}
                          rows={4}
                          className="w-full rounded-lg bg-dark-base border border-slate-700 text-slate-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Replace resume (optional)</label>
                        {application.resumeUrl && (
                          <div className="mb-2 text-xs text-slate-400">
                            Current resume:{' '}
                            <a
                              href={application.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700"
                            >
                              {decodeURIComponent(application.resumeUrl.split('/').pop() || 'resume')}
                            </a>
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setEditResumeFile(e.target.files?.[0] || null)}
                          className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-slate-100 hover:file:bg-slate-700"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => saveEdit(application._id)}
                          disabled={isUpdatingApplication}
                          className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={isUpdatingApplication}
                          className="px-4 py-2 rounded-lg bg-dark-base text-slate-200 text-sm font-medium hover:bg-dark-card border border-slate-700 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {application.coverLetter && (
                        <details className="mt-3">
                          <summary className="text-sm text-primary-600 cursor-pointer hover:text-primary-700">
                            View Cover Letter
                          </summary>
                          <p className="mt-2 text-slate-300 text-sm bg-dark-base p-3 rounded">
                            {application.coverLetter}
                          </p>
                        </details>
                      )}
                      {application.resumeUrl && (
                        <a
                          href={application.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700"
                        >
                          View Resume
                        </a>
                      )}
                    </>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                  </span>

                  {application.status === 'pending' && editingId !== application._id && (
                    <div className="mt-3 flex gap-2 justify-end">
                      <button
                        onClick={() => startEdit(application)}
                        className="px-3 py-1.5 rounded-lg bg-dark-base text-slate-200 text-sm hover:bg-dark-card border border-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteApplication(application._id)}
                        disabled={isDeletingApplication}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.pagination.pages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;