import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { useStudent } from '../../hooks/useStudent';
import { useAuth } from '../../hooks/useAuth';
import { 
  FiMapPin, FiCalendar, FiBriefcase, FiUsers, FiBookmark, 
  FiCheckCircle, FiShare2, FiArrowLeft, FiMail, FiExternalLink 
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { BACKEND_URL } from '../../services/api';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { usePublicJob } = useJobs();
  const { applyForJob, saveJob, unsaveJob, useSavedJobs } = useStudent();
  const { data: jobData, isLoading } = usePublicJob(id);
  const { data: savedJobsData, refetch } = useSavedJobs();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  const job = jobData?.data;
  const isSaved = savedJobsData?.data?.some(j => j._id === id);
  const posterSrc = job?.posterUrl
    ? (/^https?:\/\//i.test(job.posterUrl)
        ? job.posterUrl
        : `${BACKEND_URL}${job.posterUrl.startsWith('/') ? '' : '/'}${job.posterUrl}`)
    : null;

  const shareJobUrl = `${window.location.origin}/jobs/${id}`;
  const shareText = `${job?.jobTitle || 'Internship Opportunity'} at ${job?.company || 'a company'}\n\nJob details: ${shareJobUrl}`;
  const shareTextWithPosterUrl = `${shareText}${posterSrc ? `\nPoster: ${posterSrc}` : ''}`;

  const getPosterFileForShare = async () => {
    if (!posterSrc) return null;

    const response = await fetch(posterSrc);
    if (!response.ok) {
      throw new Error('Failed to load poster image');
    }

    const blob = await response.blob();
    const contentType = blob.type || 'image/png';

    const extFromType = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/webp': 'webp',
    };

    const ext = extFromType[contentType] || 'png';
    const safeTitle = (job?.jobTitle || 'job-poster')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40);

    const fileName = `${safeTitle || 'job-poster'}.${ext}`;
    return new File([blob], fileName, { type: contentType });
  };

  const canShareFiles = (files) => {
    if (!files || files.length === 0) return false;
    if (typeof navigator === 'undefined') return false;
    if (!navigator.share) return false;
    if (!navigator.canShare) return false;
    try {
      return navigator.canShare({ files });
    } catch {
      return false;
    }
  };

  const shareNative = async ({ preferFiles }) => {
    try {
      if (!navigator.share) {
        throw new Error('Native share not supported');
      }

      if (preferFiles && posterSrc) {
        const posterFile = await getPosterFileForShare();
        if (posterFile && canShareFiles([posterFile])) {
          await navigator.share({
            title: `${job?.jobTitle || 'Opportunity'}`,
            text: shareText,
            url: shareJobUrl,
            files: [posterFile],
          });
          return true;
        }
      }

      await navigator.share({
        title: `${job?.jobTitle || 'Opportunity'}`,
        text: posterSrc ? shareTextWithPosterUrl : shareText,
        url: shareJobUrl,
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  const copyPosterImageToClipboard = async ({ silent = false, closeModal = true } = {}) => {
    if (!posterSrc) {
      if (!silent) toast.error('No poster available for this job');
      return false;
    }

    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
      if (!silent) toast.error('Copy image is not supported in this browser');
      return false;
    }

    try {
      const response = await fetch(posterSrc);
      if (!response.ok) {
        throw new Error('Failed to load poster image');
      }
      const blob = await response.blob();

      // Some browsers require a PNG clipboard type
      const mimeType = blob.type || 'image/png';
      const clipboardBlob = mimeType.startsWith('image/') ? blob : new Blob([blob], { type: 'image/png' });

      await navigator.clipboard.write([
        new ClipboardItem({
          [clipboardBlob.type]: clipboardBlob,
        }),
      ]);

      if (!silent) toast.success('Poster image copied. Paste it to share.');
      if (closeModal) setShowShareModal(false);
      return true;
    } catch (e) {
      console.error('Copy poster failed:', e);
      if (!silent) toast.error('Failed to copy poster image');
      return false;
    }
  };

  const downloadPosterImage = async () => {
    if (!posterSrc) {
      toast.error('No poster available for this job');
      return;
    }

    try {
      const response = await fetch(posterSrc);
      if (!response.ok) {
        throw new Error('Failed to load poster image');
      }
      const blob = await response.blob();

      const contentType = blob.type || 'image/png';
      const extFromType = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/webp': 'webp',
      };
      const ext = extFromType[contentType] || 'png';

      const safeTitle = (job?.jobTitle || 'job-poster')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 40);
      const fileName = `${safeTitle || 'job-poster'}.${ext}`;

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      setShowShareModal(false);
    } catch (e) {
      console.error('Download poster failed:', e);
      toast.error('Failed to download poster image');
    }
  };

  const shareToWhatsApp = () => {
    // Try to share the actual image via native share sheet (best effort, mostly mobile).
    shareNative({ preferFiles: true }).then((didShare) => {
      if (didShare) {
        setShowShareModal(false);
        return;
      }

      // Desktop: we can't auto-paste into WhatsApp, but we can auto-copy the image.
      copyPosterImageToClipboard({ silent: true, closeModal: false }).finally(() => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        toast.success('Poster copied. Paste (Ctrl+V) in WhatsApp chat.');
        setShowShareModal(false);
      });
    });
  };

  const shareToMessenger = () => {
    // Try to share the actual image via native share sheet (best effort).
    shareNative({ preferFiles: true }).then((didShare) => {
      if (didShare) {
        setShowShareModal(false);
        return;
      }
      // Desktop: Facebook share dialog shares URL only (no file attachment).
      copyPosterImageToClipboard({ silent: true, closeModal: false }).finally(() => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareJobUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        toast.success('Poster copied. Paste (Ctrl+V) in chat if supported.');
        setShowShareModal(false);
      });
    });
  };

  const shareToEmail = () => {
    // mailto: cannot attach files; try native share first so email apps can receive the image.
    shareNative({ preferFiles: true }).then((didShare) => {
      if (didShare) {
        setShowShareModal(false);
        return;
      }

      // Desktop: we can't attach via mailto, but we can copy the image so the user can paste into webmail/client.
      copyPosterImageToClipboard({ silent: true, closeModal: false }).finally(() => {
        const subject = `Internship Opportunity: ${job?.jobTitle || ''}`.trim();
        const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
        window.location.href = mailto;
        toast.success('Poster copied. Paste (Ctrl+V) into your email.');
        setShowShareModal(false);
      });
    });
  };

  const handleSaveJob = async () => {
    if (!user) {
      toast.error('Please login to save jobs');
      navigate('/login');
      return;
    }
    if (isSaved) {
      await unsaveJob(id);
    } else {
      await saveJob(id);
    }
    refetch();
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can apply for internships');
      return;
    }
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    setIsApplying(true);
    try {
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await applyForJob({ jobId: id, data: formData });
      setShowApplyModal(false);
      setCoverLetter('');
      setResumeFile(null);
    } catch (error) {
      console.error('Error applying:', error);
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) return <Loader />;

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-white">Job not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <button
      onClick={() => navigate(-1)}
      className="mb-6 flex items-center gap-2 text-slate-300 hover:text-white transition"
    >
      <FiArrowLeft />
      Back to Jobs
    </button>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
      <div className="bg-dark-card rounded-xl shadow-md p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary-300 mb-2">
          Featured Opportunity
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          {job.jobTitle}
          </h1>
          <p className="text-sm md:text-base text-slate-300 mt-2 flex items-center gap-2">
          <span className="font-medium">{job.company}</span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1">
            <FiMapPin className="h-4 w-4" />
            {job.location?.city || 'Location'}
            {job.location?.isRemote && <span className="text-green-500 ml-1">Remote</span>}
          </span>
          </p>
        </div>
        {user?.role !== 'employer' && (
          <button
          onClick={handleSaveJob}
          className={`p-2 rounded-full border border-slate-700 bg-slate-900/60 transition ${
            isSaved ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
          }`}
          >
          <FiBookmark className="h-5 w-5" />
          </button>
        )}
        </div>

        {posterSrc && (
          <div className="mt-6">
            <img
              src={posterSrc}
              alt={`${job.jobTitle} poster`}
              className="w-full h-auto max-h-96 object-contain rounded-xl border border-slate-800 bg-slate-950/40"
              loading="lazy"
            />
          </div>
        )}

        <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-white mb-3">Description</h2>
          <p className="text-sm md:text-base text-slate-200 leading-relaxed whitespace-pre-wrap">
          {job.description}
          </p>
        </div>

        <div className="bg-dark-base/80 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base md:text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-600/10 text-primary-300 text-sm">
            <FiCheckCircle />
          </span>
          Requirements
          </h3>
          <p className="text-sm text-slate-200 whitespace-pre-wrap">{job.requirements}</p>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div>
          <h3 className="text-base md:text-lg font-semibold text-white mb-3">Key Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-xs font-medium text-slate-200"
            >
              {skill}
            </span>
            ))}
          </div>
          </div>
        )}
        </div>
      </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
      <div className="bg-dark-card rounded-xl shadow-md p-6 md:p-7">
        <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-400 mb-4">
        Position Details
        </h2>
        <div className="space-y-4 text-sm text-slate-200">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-400">
          <FiCalendar className="h-4 w-4" />
          Posted
          </span>
          <span>{job.createdAt ? format(new Date(job.createdAt), 'MMM dd, yyyy') : '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-400">
          <FiBriefcase className="h-4 w-4" />
          Level
          </span>
          <span>{job.experienceLevel || 'Not specified'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-400">
          <FiMail className="h-4 w-4" />
          Commitment
          </span>
          <span>{job.employmentType || 'Internship'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-400">
          <FiUsers className="h-4 w-4" />
          Positions
          </span>
          <span>{job.positionsAvailable || 1}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-400">
          <FiCalendar className="h-4 w-4" />
          Deadline
          </span>
          <span>{format(new Date(job.applicationDeadline), 'MMM dd, yyyy')}</span>
        </div>
        </div>

        <div className="mt-6 space-y-3">
        {user?.role !== 'employer' && (
          <button
          onClick={handleApply}
          className="w-full btn-primary flex items-center justify-center gap-2"
          >
          Apply for this Role
          </button>
        )}
        <button
          onClick={handleSaveJob}
          className="w-full btn-secondary flex items-center justify-center gap-2"
        >
          {isSaved ? 'Saved' : 'Save for Later'}
        </button>
        <button
          onClick={() => setShowShareModal(true)}
          className="w-full btn-secondary flex items-center justify-center gap-2 text-xs"
          type="button"
        >
          <FiShare2 className="h-4 w-4" />
          Share Opportunity
        </button>
        </div>
      </div>

      <div className="bg-dark-card rounded-xl shadow-md p-6 md:p-7">
        <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-400 mb-3">
        About {job.company}
        </h3>
        <p className="text-sm text-slate-300">
        {job.company} is offering this opportunity to help you gain real-world experience and grow your skills.
        </p>
        <button className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary-300 hover:text-primary-200">
        View company profile
        <FiExternalLink className="h-3 w-3" />
        </button>
      </div>
      </div>
    </div>

    {/* Apply Modal */}
    <Modal
    isOpen={showApplyModal}
    onClose={() => setShowApplyModal(false)}
    title=""
    size="lg"
    >
    <div className="bg-dark-card rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6">
      <div>
      <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-primary-300 mb-2">
        Career Bridge
      </p>
      <h2 className="text-xl md:text-2xl font-bold text-white">Apply for this position</h2>
      <p className="mt-2 text-xs md:text-sm text-slate-400 max-w-xl">
        Your journey from education to employment starts here. Provide your professional details below.
      </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
        <input
         type="text"
         value={user?.name || user?.fullName || ''}
         readOnly
         className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-300 text-sm shadow-sm cursor-not-allowed"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
        <input
         type="email"
         value={user?.email || ''}
         readOnly
         className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-300 text-sm shadow-sm cursor-not-allowed"
        />
      </div>
      </div>

      <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">Cover Letter</label>
      <textarea
        value={coverLetter}
        onChange={(e) => setCoverLetter(e.target.value)}
        rows={7}
        className="mt-1 block w-full rounded-xl border-slate-700 bg-slate-900/70 text-slate-100 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
        placeholder="Tell us about your journey, your skills, and why you're a great fit for this opportunity..."
      />
      </div>

      <div>
      <label className="block text-xs font-medium text-slate-300 mb-2">Upload CV / Resume</label>
      <div className="rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
        <div className="text-slate-400 text-xs mb-3">
        <p className="font-medium mb-1">Click to upload or drag and drop</p>
        <p className="text-[11px] text-slate-500">PDF, DOC, or DOCX (Max 10MB)</p>
        </div>
        <input
         type="file"
         accept=".pdf,.doc,.docx"
         onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
         className="block w-full text-xs text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-500/10 file:text-primary-200 hover:file:bg-primary-500/20"
        />
        {resumeFile && (
        <p className="mt-2 text-[11px] text-slate-400">Selected file: {resumeFile.name}</p>
        )}
      </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
      <button
        onClick={() => setShowApplyModal(false)}
        className="btn-secondary"
      >
        Cancel
      </button>
      <button
        onClick={submitApplication}
        disabled={isApplying}
        className="btn-primary px-6"
      >
        {isApplying ? 'Submitting...' : 'Submit Application'}
      </button>
      </div>
    </div>
    </Modal>

    {/* Share Modal */}
    <Modal
      isOpen={showShareModal}
      onClose={() => setShowShareModal(false)}
      title="Share Opportunity"
      size="md"
    >
      <div className="bg-dark-card rounded-2xl border border-slate-800 p-6 md:p-8 space-y-4">
        <p className="text-sm text-slate-300">
          Share this opportunity via your preferred platform.
        </p>
        {posterSrc && (
          <div className="space-y-3">
            <button
              onClick={copyPosterImageToClipboard}
              className="w-full btn-secondary flex items-center justify-center gap-2"
              type="button"
            >
              Copy Poster Image (Desktop)
            </button>
            <button
              onClick={downloadPosterImage}
              className="w-full btn-secondary flex items-center justify-center gap-2"
              type="button"
            >
              Download Poster
            </button>
          </div>
        )}
        <div className="space-y-3">
          <button
            onClick={shareToWhatsApp}
            className="w-full btn-primary flex items-center justify-center gap-2"
            type="button"
          >
            WhatsApp
          </button>
          <button
            onClick={shareToMessenger}
            className="w-full btn-secondary flex items-center justify-center gap-2"
            type="button"
          >
            Messenger / Facebook
          </button>
          <button
            onClick={shareToEmail}
            className="w-full btn-secondary flex items-center justify-center gap-2"
            type="button"
          >
            <FiMail className="h-4 w-4" />
            Email
          </button>
        </div>
        {posterSrc && (
          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-400 mb-2">Poster link</p>
            <a
              href={posterSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-300 hover:text-primary-200 break-all"
            >
              {posterSrc}
            </a>
          </div>
        )}
      </div>
    </Modal>
    </div>
  );
};

export default JobDetailsPage;