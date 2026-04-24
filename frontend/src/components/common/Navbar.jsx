import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { FiBriefcase, FiUser, FiLogOut, FiBarChart2, FiFileText, FiPlus, FiMenu, FiX, FiBell, FiExternalLink, FiCheckCircle, FiChevronDown, FiBookOpen, FiLayers, FiPlayCircle } from 'react-icons/fi';
import { notificationService } from '../../services/notificationService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPracticeMenuOpen, setIsPracticeMenuOpen] = useState(false);
  const [isReadinessMenuOpen, setIsReadinessMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const notificationMenuRef = useRef(null);
  const practiceMenuRef = useRef(null);
  const readinessMenuRef = useRef(null);

  const loadNotifications = async () => {
    if (!user) return;

    setNotificationsLoading(true);
    try {
      const [listResponse, countResponse] = await Promise.all([
        notificationService.getNotifications({ limit: 10 }),
        notificationService.getUnreadCount(),
      ]);

      setNotifications(listResponse.data || []);
      setUnreadCount(countResponse.data?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsNotificationOpen(false);
      return;
    }

    loadNotifications();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }

      if (practiceMenuRef.current && !practiceMenuRef.current.contains(event.target)) {
        setIsPracticeMenuOpen(false);
      }

      if (readinessMenuRef.current && !readinessMenuRef.current.contains(event.target)) {
        setIsReadinessMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationService.markAsRead(notification._id);
        setUnreadCount((current) => Math.max(current - 1, 0));
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
          )
        );
      }

      if (notification.link) {
        navigate(notification.link);
      }

      setIsNotificationOpen(false);
    } catch (error) {
      console.error('Failed to open notification:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const notificationTime = (timestamp) => {
    if (!timestamp) return 'just now';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/70 bg-dark-card/95 shadow-lg backdrop-blur">
      <div className="mx-auto w-full max-w-[1800px] px-6 sm:px-8 lg:px-10">
        <div className="flex h-20 items-center justify-between gap-6">
        <div className="flex shrink-0 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FiBriefcase className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-slate-100">Career Bridge</span>
              <span className="text-xs text-slate-400 hidden sm:inline">Sri Lanka</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-2 xl:gap-3">
            <Link to="/browse-jobs" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
              Browse Jobs
            </Link>
            <div className="relative" ref={practiceMenuRef}>
              <button
                type="button"
                onClick={() => setIsPracticeMenuOpen((current) => !current)}
                className="flex items-center gap-1.5 text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition"
                aria-haspopup="menu"
                aria-expanded={isPracticeMenuOpen}
              >
                Interview Practice
                <FiChevronDown className={`h-4 w-4 transition-transform ${isPracticeMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPracticeMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-700 bg-[#101935] shadow-2xl overflow-hidden z-50">
                  <Link
                    to="/lobbies"
                    onClick={() => setIsPracticeMenuOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-900/70 hover:text-primary-300 transition"
                  >
                    <FiPlayCircle className="mt-0.5 h-4 w-4 text-primary-400" />
                    <span>
                      <span className="block font-semibold text-slate-100">Lobby list</span>
                      <span className="block text-xs text-slate-400">Join a live mock interview room</span>
                    </span>
                  </Link>
                  <Link
                    to="/lobbies/create"
                    onClick={() => setIsPracticeMenuOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-900/70 hover:text-primary-300 transition border-t border-slate-800"
                  >
                    <FiLayers className="mt-0.5 h-4 w-4 text-primary-400" />
                    <span>
                      <span className="block font-semibold text-slate-100">Create lobby</span>
                      <span className="block text-xs text-slate-400">Host a timed practice session</span>
                    </span>
                  </Link>
                  <Link
                    to="/resources"
                    onClick={() => setIsPracticeMenuOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-900/70 hover:text-primary-300 transition border-t border-slate-800"
                  >
                    <FiBookOpen className="mt-0.5 h-4 w-4 text-primary-400" />
                    <span>
                      <span className="block font-semibold text-slate-100">Resource tracker</span>
                      <span className="block text-xs text-slate-400">Track prep material and progress</span>
                    </span>
                  </Link>
                </div>
              )}
            </div>
            <Link to="/faq" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
              FAQ
            </Link>
            <div className="relative" ref={readinessMenuRef}>
              <button
                type="button"
                onClick={() => setIsReadinessMenuOpen((current) => !current)}
                className="flex items-center gap-1.5 text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition"
                aria-haspopup="menu"
                aria-expanded={isReadinessMenuOpen}
              >
                Career Readiness
                <FiChevronDown className={`h-4 w-4 transition-transform ${isReadinessMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isReadinessMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-700 bg-[#101935] shadow-2xl overflow-hidden z-50">
                  <Link
                    to="/career"
                    onClick={() => setIsReadinessMenuOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-900/70 hover:text-primary-300 transition"
                  >
                    <FiBarChart2 className="mt-0.5 h-4 w-4 text-primary-400" />
                    <span>
                      <span className="block font-semibold text-slate-100">Overview</span>
                      <span className="block text-xs text-slate-400">Open the readiness landing page</span>
                    </span>
                  </Link>
                  <Link
                    to="/resume"
                    onClick={() => setIsReadinessMenuOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-900/70 hover:text-primary-300 transition border-t border-slate-800"
                  >
                    <FiFileText className="mt-0.5 h-4 w-4 text-primary-400" />
                    <span>
                      <span className="block font-semibold text-slate-100">Résumé builder</span>
                      <span className="block text-xs text-slate-400">Edit, preview, and export</span>
                    </span>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsReadinessMenuOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-900/70 hover:text-primary-300 transition border-t border-slate-800"
                  >
                    <FiBarChart2 className="mt-0.5 h-4 w-4 text-primary-400" />
                    <span>
                      <span className="block font-semibold text-slate-100">Analytics</span>
                      <span className="block text-xs text-slate-400">Track tasks, score, and alerts</span>
                    </span>
                  </Link>
                </div>
              )}
            </div>
            <Link to="/qa" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
              Q&A
            </Link>
            <Link to="/feedback" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">
              Feedback
            </Link>
          </div>

          <div className="hidden md:flex shrink-0 items-center gap-3">
            {user ? (
              <>
                {user.role === 'employer' && (
                  <>
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
                  className="flex items-center space-x-2 rounded-full border border-slate-700/80 bg-slate-900/40 px-3 py-1.5 hover:bg-slate-900/70 transition"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiUser className="text-primary-600" />
                  </div>
                  <span className="text-sm text-slate-200">{user.name}</span>
                </button>
                <div className="relative" ref={notificationMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      const nextOpen = !isNotificationOpen;
                      setIsNotificationOpen(nextOpen);
                      if (nextOpen) {
                        loadNotifications();
                      }
                    }}
                    className="relative flex items-center justify-center h-10 w-10 rounded-full border border-slate-700 text-slate-200 hover:bg-dark-base hover:text-primary-400 transition"
                    aria-label="Notifications"
                  >
                    <FiBell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-700 bg-[#101935] shadow-2xl overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">Notifications</p>
                          <p className="text-xs text-slate-400">Latest updates from your account</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary-400 hover:text-primary-300 transition"
                          disabled={unreadCount === 0}
                        >
                          Mark all read
                        </button>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notificationsLoading ? (
                          <div className="px-4 py-6 text-sm text-slate-400">Loading notifications...</div>
                        ) : notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <button
                              key={notification._id}
                              type="button"
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full text-left px-4 py-4 border-b border-slate-800 hover:bg-slate-900/70 transition ${
                                notification.isRead ? 'bg-transparent' : 'bg-slate-900/40'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${notification.isRead ? 'bg-slate-700 text-slate-300' : 'bg-primary-500/20 text-primary-400'}`}>
                                  {notification.isRead ? <FiExternalLink className="h-4 w-4" /> : <FiBell className="h-4 w-4" />}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate-100 truncate">
                                        {notification.title}
                                      </p>
                                      <p className="mt-1 text-sm text-slate-300 line-clamp-2">
                                        {notification.message}
                                      </p>
                                    </div>
                                    {!notification.isRead && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-400 shrink-0" />}
                                  </div>
                                  <p className="mt-2 text-xs text-slate-500">
                                    {notificationTime(notification.createdAt)}
                                  </p>
                                </div>
                              </div>

                              {notification.link && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-primary-400">
                                  <FiExternalLink className="h-3 w-3" />
                                  Open notification
                                </div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-10 text-center">
                            <FiCheckCircle className="mx-auto h-10 w-10 text-slate-500" />
                            <p className="mt-3 text-sm font-medium text-slate-200">No notifications yet</p>
                            <p className="mt-1 text-xs text-slate-500">New job posts and applications will appear here.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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
          <div className="md:hidden ml-auto flex items-center">
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
              <div className="border-t border-slate-800 pt-3">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Interview Practice</p>
                <Link to="/lobbies" className="flex items-center gap-2 text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  <FiPlayCircle />
                  Lobby list
                </Link>
                <Link to="/lobbies/create" className="flex items-center gap-2 text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  <FiLayers />
                  Create lobby
                </Link>
                <Link to="/resources" className="flex items-center gap-2 text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  <FiBookOpen />
                  Resource tracker
                </Link>
              </div>
              <Link to="/faq" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                FAQ
              </Link>
              <div className="border-t border-slate-800 pt-3">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Career Readiness</p>
                <Link to="/career" className="flex items-center gap-2 text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  <FiBarChart2 />
                  Overview
                </Link>
                <Link to="/resume" className="flex items-center gap-2 text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  <FiFileText />
                  Résumé builder
                </Link>
              </div>
              <Link to="/qa" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Q&A
              </Link>
              <Link to="/feedback" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Feedback
              </Link>
              {user ? (
                <>
                  {user.role === 'employer' && (
                    <>
                      <Link to="/employer/my-jobs" className="text-slate-200 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                        My Jobs
                      </Link>
                      <Link to="/employer/create-job" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium text-center">
                        Post Job
                      </Link>
                    </>
                  )}
                  <div className="border-t pt-3">
                    <button
                      type="button"
                      onClick={handleProfileClick}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-left rounded-md hover:bg-slate-900/50 transition"
                    >
                      <FiUser className="text-slate-300" />
                      <span className="text-sm text-slate-200">{user.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationOpen((current) => !current);
                        loadNotifications();
                      }}
                      className="flex items-center justify-between px-3 py-2 text-sm text-slate-200 w-full"
                    >
                      <span className="flex items-center gap-2">
                        <FiBell />
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
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