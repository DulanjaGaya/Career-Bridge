import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import Login from './pages/auth/Login';
// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';
import MyJobs from './pages/employer/MyJobs';
import CreateJob from './pages/employer/CreateJob';
import EditJob from './pages/employer/EditJob';
import EmployerJobDetails from './pages/employer/JobDetailsPage';
// Student Pages
import StudentDashboard from './pages/student/StudentDashboardPage';
import BrowseJobs from './pages/student/BrowseJobs';
import AppliedJobsPage from './pages/student/AppliedJobsPage';
import SavedJobsPage from './pages/student/SavedJobsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentJobDetails from './pages/student/JobDetailsPage';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';


function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/browse-jobs" element={<BrowseJobs />} />
          <Route path="/jobs/:id" element={<StudentJobDetails />} />

          {/* Employer Routes */}
          <Route 
            path="/employer/dashboard" 
            element={user?.role === 'employer' ? <EmployerDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/employer/my-jobs" 
            element={user?.role === 'employer' ? <MyJobs /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/employer/create-job" 
            element={user?.role === 'employer' ? <CreateJob /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/employer/edit-job/:id" 
            element={user?.role === 'employer' ? <EditJob /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/employer/jobs/:id" 
            element={user?.role === 'employer' ? <EmployerJobDetails /> : <Navigate to="/login" />} 
          />

          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/student/applied-jobs" 
            element={user?.role === 'student' ? <AppliedJobsPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/student/saved-jobs" 
            element={user?.role === 'student' ? <SavedJobsPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/student/profile" 
            element={user?.role === 'student' ? <StudentProfilePage /> : <Navigate to="/login" />} 
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      
    </div>
  );
}

export default App;