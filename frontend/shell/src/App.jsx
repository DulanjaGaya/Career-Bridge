import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";

const featureRoutes = [
  {
    path: "auth",
    label: "Login & Authentication",
    module: "M",
    src: "http://localhost:5174/login"
  },
  {
    path: "user-management",
    label: "User Management",
    module: "M",
    src: "http://localhost:5174/admin"
  },
  {
    path: "qa-feedback",
    label: "Q&A + Feedback",
    module: "M",
    src: "http://localhost:5174/qa"
  },
  {
    path: "internships",
    label: "Internship Posting Management",
    module: "I",
    src: "http://localhost:5175/browse-jobs"
  },
  {
    path: "smart-search",
    label: "Smart Filter & Search",
    module: "I",
    src: "http://localhost:5175/browse-jobs"
  },
  {
    path: "resume-builder",
    label: "CV / Resume Builder",
    module: "T",
    src: "http://localhost:5176/"
  },
  {
    path: "progress",
    label: "Dashboard Progress",
    module: "T",
    src: "http://localhost:5176/"
  },
  {
    path: "mock-interview",
    label: "Mock Interview Lobby",
    module: "D",
    src: "http://localhost:5177/lobbies"
  },
  {
    path: "resources",
    label: "Resource Tracker",
    module: "D",
    src: "http://localhost:5177/resources"
  }
];

function TopNav() {
  const location = useLocation();
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        Career Bridge
      </Link>
      <nav className="topnav">
        {featureRoutes.map((item) => (
          <Link
            key={item.path}
            to={`/app/${item.path}`}
            className={location.pathname === `/app/${item.path}` ? "chip active" : "chip"}
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
    <section>
      <h1>Career Bridge - Seamless Version</h1>
      <p>One navigation, all features in one website experience, with T/I/D/M folders preserved.</p>
      <div className="cards">
        {featureRoutes.map((item) => (
          <Link to={`/app/${item.path}`} className="card" key={item.path}>
            <strong>{item.label}</strong>
            <span className="meta">Module {item.module}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeatureHost({ routeKey }) {
  const feature = featureRoutes.find((item) => item.path === routeKey);
  if (!feature) {
    return <Navigate to="/" replace />;
  }
  return (
    <section className="module-wrap">
      <div className="module-head">
        <h2>{feature.label}</h2>
        <p>Serving from module {feature.module}</p>
      </div>
      <iframe title={feature.label} src={feature.src} className="module-frame" />
    </section>
  );
}

function AppLayout() {
  return (
    <>
      <TopNav />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          {featureRoutes.map((item) => (
            <Route
              key={item.path}
              path={`/app/${item.path}`}
              element={<FeatureHost routeKey={item.path} />}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return <AppLayout />;
}
