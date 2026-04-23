import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import UserManagementPage from "./pages/UserManagementPage";
import QaFeedbackPage from "./pages/QaFeedbackPage";
import InternshipsPage from "./pages/InternshipsPage";
import SmartSearchPage from "./pages/SmartSearchPage";
import ResumeBuilderPage from "./pages/ResumeBuilderPage";
import ProgressPage from "./pages/ProgressPage";
import MockInterviewPage from "./pages/MockInterviewPage";
import ResourcesPage from "./pages/ResourcesPage";

const links = [
  { path: "/", label: "Home" },
  { path: "/auth", label: "Auth" },
  { path: "/users", label: "User Management" },
  { path: "/qa-feedback", label: "Q&A + Feedback" },
  { path: "/internships", label: "Internships" },
  { path: "/smart-search", label: "Smart Search" },
  { path: "/resume-builder", label: "Resume Builder" },
  { path: "/progress", label: "Progress" },
  { path: "/mock-interview", label: "Mock Interview" },
  { path: "/resources", label: "Resources" }
];

function Nav() {
  const location = useLocation();
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        Career Bridge
      </Link>
      <nav className="nav">
        {links.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? "pill active" : "pill"}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function Home() {
  return (
    <section className="panel home hero">
      <div className="badge">Platform is live and operational</div>
      <h1>
        Master your interviews.
        <br />
        <span>Land your dream job.</span>
      </h1>
      <p className="hero-sub">
        Career Bridge gives one integrated space for authentication, internship discovery, resume
        building, dashboard tracking, mock interviews, and resources.
      </p>
      <div className="home-grid">
        {links
          .filter((item) => item.path !== "/")
          .map((item) => (
            <Link key={item.path} to={item.path} className="home-card">
              {item.label}
            </Link>
          ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>Career Bridge Integrated Platform</span>
        <span>T | I | D | M</span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Nav />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/qa-feedback" element={<QaFeedbackPage />} />
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/smart-search" element={<SmartSearchPage />} />
          <Route path="/resume-builder" element={<ResumeBuilderPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/mock-interview" element={<MockInterviewPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
