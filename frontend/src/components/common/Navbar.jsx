import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiBriefcase, FiUser, FiLogOut, FiBarChart2, FiFileText, FiPlus, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    if (!user) return;
    if (user.role === 'employer') {
      navigate('/employer/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <nav className="bg-dark-card shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FiBriefcase className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-slate-100">Career Bridge</span>
              <span className="text-xs text-slate-400 hidden sm:inline">Sri Lanka</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/browse-jobs" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
              Browse Jobs
            </Link>

            {user ? (
              <>
                {user.role === 'employer' && (
                  <>
                    <Link to="/employer/dashboard" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
                      <FiBarChart2 className="inline mr-1" />
                      Dashboard
                    </Link>
                    <Link to="/employer/my-jobs" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
                      <FiFileText className="inline mr-1" />
                      My Jobs
                    </Link>
                    <Link to="/employer/create-job" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition">
                      <FiPlus className="inline mr-1" />
                      Post Job
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 border-l pl-4 ml-2 hover:bg-dark-base rounded-md px-2 py-1"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiUser className="text-primary-600" />
                  </div>
                  <span className="text-sm text-slate-200">{user.name}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  <FiLogOut className="inline mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition">
                  Register as Employer
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-200 hover:text-primary-600"
            >
              {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link to="/browse-jobs" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Browse Jobs
              </Link>
              {user ? (
                <>
                  {user.role === 'employer' && (
                    <>
                      <Link to="/employer/dashboard" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                        Dashboard
                      </Link>
                      <Link to="/employer/my-jobs" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                        My Jobs
                      </Link>
                      <Link to="/employer/create-job" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium text-center">
                        Post Job
                      </Link>
                    </>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex items-center space-x-2 px-3 py-2">
                      <FiUser className="text-slate-300" />
                      <span className="text-sm text-slate-200">{user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium w-full text-left"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium text-center">
                    Register as Employer
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;