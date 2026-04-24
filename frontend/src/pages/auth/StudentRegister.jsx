import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const StudentRegister = () => {
  const navigate = useNavigate();
  const { registerStudent, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    degree: '',
    graduationYear: '',
    skills: '',
    phone: '',
    location: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerStudent({
      ...formData,
      graduationYear: formData.graduationYear ? Number(formData.graduationYear) : undefined,
      skills: formData.skills
        ? formData.skills.split(',').map((item) => item.trim()).filter(Boolean)
        : [],
    });

    if (result?.user) {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-base py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Student Registration</h2>
          <p className="mt-2 text-center text-sm text-slate-300">Create an account to browse internships</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {[
            ['name', 'text', 'Full name'],
            ['email', 'email', 'Email address'],
            ['password', 'password', 'Password'],
            ['university', 'text', 'University'],
            ['degree', 'text', 'Degree'],
            ['graduationYear', 'text', 'Graduation year'],
            ['skills', 'text', 'Skills (comma separated)'],
            ['phone', 'text', 'Phone number'],
            ['location', 'text', 'Location'],
          ].map(([name, type, placeholder]) => (
            <div key={name}>
              <label className="sr-only" htmlFor={name}>{placeholder}</label>
              <input
                id={name}
                name={name}
                type={type}
                required={['name', 'email', 'password'].includes(name)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Register as Student'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-300">
          Already have an account? <Link to="/login" className="text-primary-400 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default StudentRegister;