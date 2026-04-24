import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
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
  { path: "/login", label: "Sign In" },
  { path: "/signup", label: "Get Started" },
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
  const topNav = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About Us" },
    { path: "/login", label: "Sign In" }
  ];
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          Career Bridge
        </Link>
        <nav className="main-nav">
          {topNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? "main-link active" : "main-link"}
            >
              {item.label}
            </Link>
          ))}
          <Link to="/signup" className="btn nav-cta">
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Home() {
  const featureLinks = links.filter((item) => !["/", "/login", "/signup"].includes(item.path));
  return (
    <section className="hero">
      <div className="badge">Platform is live and operational</div>
      <h1>
        Master your interviews.
        <br />
        <span>Land your dream job.</span>
      </h1>
      <p className="hero-sub">
        Career Bridge provides an elite environment for practicing technical interviews, tracking
        your learning resources, and collaborating in real-time mock lobbies.
      </p>
      <div className="hero-actions">
        <Link to="/signup" className="btn">
          Start Practicing Free
        </Link>
        <Link to="/mock-interview" className="btn ghost">
          View Mock Lobbies
        </Link>
      </div>
      <section className="panel module-panel">
        <h3>Explore Career Bridge Modules</h3>
        <p>All M / I / T / D components are available as options in one website.</p>
        <div className="home-grid">
          {featureLinks.map((item) => (
            <Link key={item.path} to={item.path} className="home-card">
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}

function AboutPage() {
  const cards = [
    "Live Mock Lobbies",
    "Resource Tracker",
    "Real-time Scoreboards",
    "Internships",
    "Resume Builder",
    "Smart Search"
  ];
  return (
    <section className="panel">
      <h2>Built for top performers</h2>
      <p>
        Everything you need to prepare for technical interviews at top-tier companies in one unified
        platform.
      </p>
      <div className="home-grid">
        {cards.map((label) => (
          <div key={label} className="home-card">
            {label}
          </div>
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
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/qa-feedback" element={<QaFeedbackPage />} />
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/smart-search" element={<SmartSearchPage />} />
          <Route path="/resume-builder" element={<ResumeBuilderPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/mock-interview" element={<MockInterviewPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
