import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStudent } from '../../hooks/useStudent';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBookOpen, FiBriefcase, FiSave, FiUpload } from 'react-icons/fi';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { SRI_LANKAN_CITIES, DEGREE_PROGRAMS, UNIVERSITIES } from '../../utils/constants';

const StudentProfile = () => {
  const { useProfile, updateProfile, isUpdatingProfile } = useStudent();
  const { data: profile, isLoading, refetch } = useProfile();
  const [successMessage, setSuccessMessage] = useState('');
  const [skills, setSkills] = useState(profile?.data?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: profile?.data || {
      name: '',
      email: '',
      phone: '',
      location: '',
      university: '',
      degree: '',
      graduationYear: '',
      portfolio: '',
      bio: '',
    },
  });

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setValue('skills', updatedSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    setValue('skills', updatedSkills);
  };

  const onSubmit = async (data) => {
    try {
      await updateProfile({
        ...data,
        skills: skills,
      });
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      refetch();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Student Profile</h1>
        <p className="text-slate-300 mt-2">Manage your personal information and preferences</p>
      </div>

      {successMessage && (
        <Alert type="success" message={successMessage} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-dark-card rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiUser className="text-primary-600" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Full Name *
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                className="input-field"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email *
              </label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className="input-field"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="input-field"
                placeholder="+94 77 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Location
              </label>
              <select {...register('location')} className="input-field">
                <option value="">Select City</option>
                {SRI_LANKAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-dark-card rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiBookOpen className="text-primary-600" />
            Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                University
              </label>
              <select {...register('university')} className="input-field">
                <option value="">Select University</option>
                {UNIVERSITIES.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Degree Program
              </label>
              <select {...register('degree')} className="input-field">
                <option value="">Select Degree</option>
                {DEGREE_PROGRAMS.map(degree => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Graduation Year
              </label>
              <input
                {...register('graduationYear')}
                type="number"
                className="input-field"
                placeholder="2024"
                min={2020}
                max={2030}
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-dark-card rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiBriefcase className="text-primary-600" />
            Skills
          </h2>
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="Type a skill and press Enter"
                className="flex-1 input-field"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-dark-base text-slate-200 rounded-lg hover:bg-dark-card transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Bio & Portfolio */}
        <div className="bg-dark-card rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">About You</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="input-field"
                placeholder="Tell us about yourself, your interests, and career goals..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Portfolio / Personal Website
              </label>
              <input
                {...register('portfolio')}
                type="url"
                className="input-field"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="btn-primary flex items-center gap-2"
          >
            <FiSave className="h-4 w-4" />
            {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;