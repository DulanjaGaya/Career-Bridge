import React, { useMemo, useState } from 'react';
import { BACKEND_URL } from '../../services/api';

const JobForm = ({ initialValues = {}, onSubmit, isLoading }) => {
	const [posterFile, setPosterFile] = useState(null);
	const currentPosterSrc = useMemo(() => {
		const url = initialValues?.posterUrl;
		if (!url) return null;
		if (/^https?:\/\//i.test(url)) return url;
		if (url.startsWith('/')) return `${BACKEND_URL}${url}`;
		return `${BACKEND_URL}/${url}`;
	}, [initialValues]);

	const [formData, setFormData] = useState({
		jobTitle: initialValues.jobTitle || '',
		company: initialValues.company || '',
		specialization: initialValues.specialization || 'Software Engineering',
		requirements: initialValues.requirements || '',
		description: initialValues.description || '',
		city: initialValues.location?.city || '',
		address: initialValues.location?.address || '',
		isRemote: initialValues.location?.isRemote || false,
		applicationDeadline: initialValues.applicationDeadline
			? initialValues.applicationDeadline.slice(0, 10)
			: '',
		employmentType: initialValues.employmentType || 'Internship',
		skills: Array.isArray(initialValues.skills)
			? initialValues.skills.join(', ')
			: '',
		experienceLevel: initialValues.experienceLevel || 'Entry',
		positionsAvailable: initialValues.positionsAvailable || 1,
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handlePosterChange = (e) => {
		const file = e.target.files?.[0] || null;
		setPosterFile(file);
	};

	const buildMultipart = (status) => {
		const payload = {
			jobTitle: formData.jobTitle,
			company: formData.company,
			specialization: formData.specialization,
			requirements: formData.requirements,
			description: formData.description,
			location: {
				city: formData.city,
				address: formData.address,
				isRemote: formData.isRemote,
			},
			applicationDeadline: formData.applicationDeadline,
			employmentType: formData.employmentType,
			skills: formData.skills
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
			experienceLevel: formData.experienceLevel,
			positionsAvailable: Number(formData.positionsAvailable) || 1,
			status,
		};

		const multipart = new FormData();
		multipart.append('jobTitle', payload.jobTitle);
		multipart.append('company', payload.company);
		multipart.append('specialization', payload.specialization);
		multipart.append('requirements', payload.requirements);
		multipart.append('description', payload.description);
		multipart.append('location[city]', payload.location.city);
		if (payload.location.address) {
			multipart.append('location[address]', payload.location.address);
		}
		multipart.append('location[isRemote]', payload.location.isRemote ? 'true' : 'false');
		if (payload.applicationDeadline) {
			multipart.append('applicationDeadline', payload.applicationDeadline);
		}
		multipart.append('employmentType', payload.employmentType);
		multipart.append('experienceLevel', payload.experienceLevel);
		multipart.append('positionsAvailable', String(payload.positionsAvailable));
		payload.skills.forEach((skill) => multipart.append('skills[]', skill));
		if (payload.status) {
			multipart.append('status', payload.status);
		}
		if (posterFile) {
			multipart.append('poster', posterFile);
		}

		return multipart;
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (onSubmit) {
			onSubmit(buildMultipart('active'));
		}
	};

	const handleSaveDraft = () => {
		if (isLoading) return;
		if (onSubmit) {
			onSubmit(buildMultipart('draft'));
		}
	};

	return (
		<>
			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Section 01 - Core Identity */}
				<div className="bg-dark-card rounded-xl border border-slate-800 p-6 md:p-8 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="h-8 w-8 rounded-full bg-primary-600/10 border border-primary-500 flex items-center justify-center text-xs font-semibold text-primary-300">
								01
							</div>
							<div>
								<h2 className="text-lg md:text-xl font-semibold text-white">Core Identity</h2>
								<p className="text-xs md:text-sm text-slate-400 mt-1">
									Set the foundation of your internship role.
								</p>
							</div>
						</div>
					</div>

					<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-slate-200">Job Title</label>
							<input
								type="text"
								name="jobTitle"
								value={formData.jobTitle}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-200">Company Name</label>
							<input
								type="text"
								name="company"
								value={formData.company}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-200">
								Job Poster (optional)
							</label>
							<input
								type="file"
								name="poster"
								accept="image/png,image/jpeg,image/webp"
								onChange={handlePosterChange}
								className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900/60 text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-200 hover:file:bg-slate-700"
							/>
							{currentPosterSrc && !posterFile && (
								<div className="mt-3">
									<p className="text-xs text-slate-400 mb-2">Current poster</p>
									<img
										src={currentPosterSrc}
										alt="Current job poster"
										className="w-full h-auto max-h-40 object-contain rounded-lg border border-slate-800 bg-slate-950/40"
										loading="lazy"
									/>
								</div>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-200">Specialization</label>
							<select
								name="specialization"
								value={formData.specialization}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
								required
							>
								<option>Software Engineering</option>
								<option>Web Development</option>
								<option>Mobile Development</option>
								<option>Data Science</option>
								<option>Machine Learning</option>
								<option>DevOps</option>
								<option>Cloud Computing</option>
								<option>Cybersecurity</option>
								<option>UI/UX Design</option>
								<option>Product Management</option>
								<option>Quality Assurance</option>
								<option>IT Support</option>
								<option>Network Administration</option>
								<option>Database Administration</option>
								<option>Other</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-200">Experience Level</label>
							<select
								name="experienceLevel"
								value={formData.experienceLevel}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
							>
								<option>Entry</option>
								<option>Junior</option>
								<option>Mid-Level</option>
								<option>Senior</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-200">Employment Type</label>
							<select
								name="employmentType"
								value={formData.employmentType}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
							>
								<option>Internship</option>
								<option>Full-time</option>
								<option>Part-time</option>
								<option>Contract</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-200">Positions Available</label>
							<input
								type="number"
								name="positionsAvailable"
								min="1"
								value={formData.positionsAvailable}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
							/>
						</div>
					</div>
				</div>

				{/* Section 02 - Intellectual Depth */}
				<div className="bg-dark-card rounded-xl border border-slate-800 p-6 md:p-8 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="h-8 w-8 rounded-full bg-primary-600/10 border border-primary-500 flex items-center justify-center text-xs font-semibold text-primary-300">
								02
							</div>
							<div>
								<h2 className="text-lg md:text-xl font-semibold text-white">Intellectual Depth</h2>
								<p className="text-xs md:text-sm text-slate-400 mt-1">
									Describe the mission, daily impact, and key requirements.
								</p>
							</div>
						</div>
					</div>

					<div className="mt-4 space-y-6">
						<div>
							<label className="block text-sm font-medium text-slate-200">Job Description</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleChange}
								rows={4}
								className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-200">Key Requirements</label>
							<textarea
								name="requirements"
								value={formData.requirements}
								onChange={handleChange}
								rows={3}
								className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
								required
							/>
						</div>
					</div>
				</div>

				{/* Section 03 - Value Proposition / Location & Skills */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="bg-dark-card rounded-xl border border-slate-800 p-6 md:p-8 shadow-sm">
						<div className="flex items-center gap-3 mb-6">
							<div className="h-8 w-8 rounded-full bg-primary-600/10 border border-primary-500 flex items-center justify-center text-xs font-semibold text-primary-300">
								03
							</div>
							<div>
								<h2 className="text-lg font-semibold text-white">Location & Work Style</h2>
								<p className="text-xs md:text-sm text-slate-400 mt-1">
									Clarify where and how students will work.
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="grid grid-cols-1 gap-4">
								<div>
									<label className="block text-sm font-medium text-slate-200">City</label>
									<input
										type="text"
										name="city"
										value={formData.city}
										onChange={handleChange}
										className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-200">Address (optional)</label>
									<input
										type="text"
										name="address"
										value={formData.address}
										onChange={handleChange}
										className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
									/>
								</div>
							</div>

							<div>
								<p className="block text-sm font-medium text-slate-200 mb-2">Work Arrangement</p>
								<div className="inline-flex rounded-full bg-slate-900/60 border border-slate-700 overflow-hidden text-xs">
									<button
										type="button"
										className={`px-4 py-2 ${formData.isRemote ? 'bg-primary-600 text-white' : 'text-slate-300'}`}
										onClick={() => setFormData((prev) => ({ ...prev, isRemote: true }))}
									>
										Remote
									</button>
									<button
										type="button"
										className={`px-4 py-2 border-l border-slate-700 ${!formData.isRemote ? 'bg-primary-600 text-white' : 'text-slate-300'}`}
										onClick={() => setFormData((prev) => ({ ...prev, isRemote: false }))}
									>
										On-site
									</button>
								</div>
								<p className="mt-1 text-xs text-slate-500">Toggle between remote and on-site work.</p>
							</div>
						</div>
					</div>

					<div className="bg-dark-card rounded-xl border border-slate-800 p-6 md:p-8 shadow-sm">
						<div className="flex items-center gap-3 mb-6">
							<div className="h-8 w-8 rounded-full bg-primary-600/10 border border-primary-500 flex items-center justify-center text-xs font-semibold text-primary-300">
								04
							</div>
							<div>
								<h2 className="text-lg font-semibold text-white">Skills & Stack</h2>
								<p className="text-xs md:text-sm text-slate-400 mt-1">
									Highlight the technologies students will work with.
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-slate-200">Skills (comma separated)</label>
								<input
									type="text"
									name="skills"
									value={formData.skills}
									onChange={handleChange}
									className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
									placeholder="e.g. React, Node.js, MongoDB"
								/>
								<p className="mt-1 text-xs text-slate-500">
									Separate skills with commas to help students scan quickly.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Section 04 - Final Deadline */}
				<div className="bg-dark-card rounded-xl border border-slate-800 p-6 md:p-8 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="h-8 w-8 rounded-full bg-primary-600/10 border border-primary-500 flex items-center justify-center text-xs font-semibold text-primary-300">
								05
							</div>
							<div>
								<h2 className="text-lg md:text-xl font-semibold text-white">Final Deadline</h2>
								<p className="text-xs md:text-sm text-slate-400 mt-1">
									Let students know when applications close.
								</p>
							</div>
						</div>
					</div>

					<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-slate-200">Application Deadline</label>
							<input
								type="date"
								name="applicationDeadline"
								value={formData.applicationDeadline}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900/60 text-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
								required
							/>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mt-4">
					<button
						type="button"
						onClick={handleSaveDraft}
						disabled={isLoading}
						className="inline-flex justify-center rounded-full border border-slate-700 bg-slate-900/60 px-6 py-2.5 text-sm font-medium text-slate-200 shadow-sm hover:bg-slate-800 transition"
					>
						Save Draft
					</button>
					<button
						type="submit"
						disabled={isLoading}
						className="inline-flex justify-center rounded-full border border-transparent bg-primary-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
					>
						{isLoading ? 'Posting…' : 'Post Job'}
					</button>
				</div>
			</form>

			{/* Live Preview Card */}
			<div className="mt-10 bg-dark-card rounded-2xl border border-slate-800 p-6 md:p-8 shadow-md">
				<p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">
					Live Preview Card
				</p>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h3 className="text-lg md:text-xl font-semibold text-white">
							{formData.jobTitle || 'Your Internship Title'}
						</h3>
						<p className="text-sm text-slate-400 mt-1">
							{formData.company || 'Company Name'} •{' '}
							{formData.city || 'Location'}
							{formData.isRemote && ' • Remote'}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						{formData.specialization && (
							<span className="inline-flex items-center rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200">
								{formData.specialization}
							</span>
						)}
						{formData.experienceLevel && (
							<span className="inline-flex items-center rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200">
								{formData.experienceLevel} Level
							</span>
						)}
						{formData.employmentType && (
							<span className="inline-flex items-center rounded-full bg-primary-600/10 border border-primary-500/60 px-3 py-1 text-xs font-medium text-primary-200">
								{formData.employmentType}
							</span>
						)}
					</div>
				</div>
				{formData.skills && (
					<p className="mt-4 text-xs text-slate-400">
						Skills: {formData.skills}
					</p>
				)}
			</div>
		</>
	);
};

export default JobForm;

