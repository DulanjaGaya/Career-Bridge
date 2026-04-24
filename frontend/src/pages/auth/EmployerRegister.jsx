import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const EmployerRegister = () => {
	const navigate = useNavigate();
	const { registerEmployer, isLoading } = useAuth();

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		company: ''
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const success = await registerEmployer(formData);
		if (success) {
			navigate('/employer/dashboard');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-dark-base py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-white">
						Employer Registration
					</h2>
					<p className="mt-2 text-center text-sm text-slate-300">
						Create an account to post internship vacancies
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label className="sr-only" htmlFor="name">Full name</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
								placeholder="Full name"
								value={formData.name}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label className="sr-only" htmlFor="company">Company</label>
							<input
								id="company"
								name="company"
								type="text"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
								placeholder="Company name"
								value={formData.company}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label className="sr-only" htmlFor="email">Email address</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
								placeholder="Work email"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label className="sr-only" htmlFor="password">Password</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
								placeholder="Password"
								value={formData.password}
								onChange={handleChange}
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
						>
							{isLoading ? 'Creating account...' : 'Register as Employer'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EmployerRegister;

