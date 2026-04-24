import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { CareerDashboardPage, CareerLandingPage, CareerResumePage } from './pages/CareerBridge';
import CreateLobby from './pages/Lobby/CreateLobby';
import LobbyList from './pages/Lobby/LobbyList';
import LobbyRoom from './pages/Lobby/LobbyRoom';
import ResourceTracker from './pages/Resource/ResourceTracker';
import BrowseJobs from './pages/student/BrowseJobs';
import JobDetailsPage from './pages/student/JobDetailsPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import AppliedJobsPage from './pages/student/AppliedJobsPage';
import SavedJobsPage from './pages/student/SavedJobsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import EmployerDashboardPage from './pages/employer/Dashboard';
import CreateJobPage from './pages/employer/CreateJob';
import EditJobPage from './pages/employer/EditJob';
import EmployerJobDetailsPage from './pages/employer/JobDetailsPage';
import MyJobsPage from './pages/employer/MyJobs';
import FeedbackPage from './pages/FeedbackPage';
import EnhancedQAPage from './pages/EnhancedQAPage';
import FAQPage from './pages/FAQPage';

const getDashboardPath = (role) => {
  if (role === 'employer') {
    return '/employer/dashboard';
  }

  if (role === 'student') {
    return '/student/dashboard';
  }

  return '/browse-jobs';
};

const App = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/career" element={<CareerLandingPage />} />
          <Route path="/readiness" element={<Navigate to="/career" replace />} />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <CareerResumePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CareerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <SignupPage />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/register/student" element={<Navigate to="/signup" replace />} />
          <Route path="/register/employer" element={<Navigate to="/signup" replace />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/qa" element={user ? <EnhancedQAPage /> : <Navigate to="/login" replace />} />
          <Route path="/feedback" element={user ? <FeedbackPage /> : <Navigate to="/login" replace />} />
          <Route
            path="/lobbies"
            element={
              <ProtectedRoute>
                <LobbyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lobbies/create"
            element={
              <ProtectedRoute>
                <CreateLobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lobbies/:id"
            element={
              <ProtectedRoute>
                <LobbyRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourceTracker />
              </ProtectedRoute>
            }
          />
          <Route path="/browse-jobs" element={<BrowseJobs />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applied-jobs"
            element={
              <ProtectedRoute>
                <AppliedJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/saved-jobs"
            element={
              <ProtectedRoute>
                <SavedJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute>
                <EmployerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/my-jobs"
            element={
              <ProtectedRoute>
                <MyJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/create-job"
            element={
              <ProtectedRoute>
                <CreateJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/edit-job/:id"
            element={
              <ProtectedRoute>
                <EditJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/jobs/:id"
            element={
              <ProtectedRoute>
                <EmployerJobDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/browse-jobs" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;