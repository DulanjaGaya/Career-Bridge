import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Alert from '../../components/common/Alert';
import employeesImage from '../../assets/images/employees.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email: formData.email, password: formData.password }, formData.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-base font-sans text-slate-200">
      
      {/* Left Column - Branding / Text */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center p-16 xl:p-24 border-r border-slate-800 bg-dark-card">
        {/* Background image layer */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src={employeesImage}
            alt="Students collaborating"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Background Gradients similar to the reference graphic */}
        <div className="absolute top-0 left-0 w-full h-1/2 z-10 bg-gradient-to-b from-primary-900/40 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.14),transparent_55%)] pointer-events-none"></div>
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 z-20 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

        <div className="relative z-30 max-w-lg">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary-900/40 border border-primary-500/30 text-primary-500 text-xs font-bold tracking-widest uppercase mb-8 shadow-sm">
            Architect Your Future
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
            Your journey to professional mastery starts here.
          </h1>
          
          <p className="text-lg text-slate-400 mb-16 leading-relaxed">
            Bridge the gap between academic theory and industry excellence with our curated paths and mentorship.
          </p>

          {/* Simple visual graphic placeholder mimicking the reference image graphic */}
          <div className="flex items-center gap-6 mt-8">
            <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="h-px w-16 bg-slate-700"></div>
            <div className="w-12 h-12 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 bg-dark-base">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21l9-5-9-5-9 5 9 5zm0 0l-9-5 9-5 9 5-9 5z" />
               </svg>
            </div>
            <div className="h-px w-24 bg-gradient-to-r from-slate-700 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 relative overflow-y-auto">
        <div className="max-w-md w-full space-y-8">
          
          <div className="text-left">
            <h2 className="text-3xl font-extrabold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-400">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {error && <Alert type="error" message={error} />}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Role Slider */}
            <div>
              <div className="flex bg-dark-base/50 rounded-xl p-1 border border-slate-700 w-full shadow-inner mb-6">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'student'})}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${formData.role === 'student' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-card/50'}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'employer'})}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${formData.role === 'employer' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-card/50'}`}
                >
                  Employer
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-300 mb-1.5 cursor-pointer">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full !pl-11"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                 <label htmlFor="password" className="block text-sm font-bold text-slate-300 cursor-pointer">Password</label>
                 <a href="#" className="text-xs font-bold text-primary-500 hover:text-primary-400 transition-colors">
                   Forgot password?
                 </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full !pl-11 !pr-11 p-[14px]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center mt-4">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer bg-dark-base"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-600/20 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-base focus:ring-primary-500 transition-all disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
            
            {/* Social Logins Divider */}
            <div className="mt-8 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-dark-base text-slate-500 uppercase font-semibold tracking-wider">
                    Or continue with
                  </span>
                </div>
              </div>
            </div>
            
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center w-full px-4 py-2.5 bg-dark-card hover:bg-slate-800 border border-slate-700 rounded-xl transition text-sm font-bold text-white"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center w-full px-4 py-2.5 bg-dark-card hover:bg-slate-800 border border-slate-700 rounded-xl transition text-sm font-bold text-white"
              >
                <svg className="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,3c1.103,0,2,0.897,2,2v14c0,1.103-0.897,2-2,2H5c-1.103,0-2-0.897-2-2V5c0-1.103,0.897-2,2-2H19z M9.492,18H6.5v-8.498 h2.992V18z M8.004,8.125c-0.963,0-1.74-0.781-1.74-1.743c0-0.966,0.777-1.743,1.74-1.743c0.966,0,1.74,0.777,1.74,1.743 C9.744,7.344,8.97,8.125,8.004,8.125z M18.498,18h-2.994v-4.577c0-1.077-0.021-2.464-1.503-2.464 c-1.503,0-1.734,1.173-1.734,2.385V18h-2.994v-8.498h2.872v1.163h0.041c0.398-0.758,1.378-1.556,2.83-1.556 c3.031,0,3.585,1.996,3.585,4.588V18z"/>
                </svg>
                LinkedIn
              </button>
            </div>
            
            <p className="mt-8 text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/register/student" className="font-bold text-primary-500 hover:text-primary-400 transition-colors">
                Sign Up
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;