import { Link, NavLink, Route, Routes } from "react-router-dom";
import { useSession } from "./hooks/useSession";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import ResumePage from "./pages/ResumePage";

export default function App() {
  const { userId, loading, error } = useSession();

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand brand-link">
          <span className="brand-mark" aria-hidden />
          <div>
            <div className="brand-title">Career Bridge</div>
            <div className="brand-sub">Résumé · readiness · analytics</div>
          </div>
        </Link>
        <nav className="nav nav-main">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
          <NavLink to="/resume" className={({ isActive }) => (isActive ? "active" : "")}>
            CV/Resume
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            Analytics
          </NavLink>
        </nav>
        <div className="session session-compact">
          <Link className="btn btn-cta btn-sm" to="/resume">
            Get started
          </Link>
        </div>
      </header>

      {error && <div className="banner error">{error}</div>}

      <main className="main main--fluid">
        <Routes>
          <Route path="/" element={<LandingPage loading={loading} />} />
          <Route path="/resume" element={<ResumePage userId={userId} bootstrapping={loading} />} />
          <Route path="/dashboard" element={<DashboardPage userId={userId} bootstrapping={loading} />} />
        </Routes>
      </main>
    </div>
  );
}
