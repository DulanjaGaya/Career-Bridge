import { Link } from "react-router-dom";

type Props = {
  loading?: boolean;
};

export default function LandingPage({ loading }: Props) {
  return (
    <div className="landing-page">
      {loading && (
        <div className="banner ok" style={{ margin: "1rem 1.5rem 0", maxWidth: "1120px" }}>
          Preparing your workspace…
        </div>
      )}
      <section className="cb-hero">
        <div className="cb-container cb-hero-grid">
          <div className="cb-hero-copy">
            <p className="cb-eyebrow">The future of workforce readiness</p>
            <h1 className="cb-hero-title">
              Bridging the gap between <span className="cb-accent">education</span> and employment
            </h1>
            <p className="cb-hero-lede">
              Build a polished CV/Resume, track career milestones, and see readiness analytics — one place for anyone
              preparing for internships, interviews, and their first role.
            </p>
            <div className="cb-hero-actions">
              <Link className="btn btn-cta" to="/resume">
                Get started
              </Link>
              <Link className="btn btn-ghost-light" to="/dashboard">
                View analytics
              </Link>
            </div>
          </div>
          <div className="cb-hero-visual">
            <div className="cb-hero-frame">
              <figure className="cb-hero-art">
                <img
                  className="cb-hero-art-img"
                  src="/images/hero-education.jpg"
                  alt="Students collaborating in a classroom, representing the path from education to career opportunity"
                  width={960}
                  height={720}
                  loading="eager"
                  decoding="async"
                />
                <figcaption className="cb-hero-art-caption">Education → opportunity</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="cb-trust">
        <div className="cb-container">
          <p className="cb-trust-label">join the tech world with pioneers</p>
          <div className="cb-logo-strip">
            {["Company A", "Company B", "Company C", "Company D", "Company E"].map((name) => (
              <div key={name} className="cb-logo-placeholder">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cb-solutions" id="solutions">
        <div className="cb-container">
          <h2 className="cb-section-title">CV/Resume &amp; readiness in one place</h2>
          <p className="cb-section-lede">
            Structured sections, validation, exports, and a dashboard to track milestones — built for people preparing
            their next step.
          </p>
          <div className="cb-card-grid cb-card-grid--solo">
            <article className="cb-feature-card">
              <div className="cb-feature-icon">📄</div>
              <h3>CV/Resume</h3>
              <p>Guided résumé sections, validation, exports, and a readiness dashboard to stay on track.</p>
              <Link className="cb-link-arrow" to="/resume">
                Open résumé builder →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="cb-analytics">
        <div className="cb-container cb-analytics-grid">
          <div>
            <p className="cb-eyebrow">Precision analytics</p>
            <h2 className="cb-section-title">Data-driven decisions for the future of work</h2>
            <p className="cb-section-lede">
              The dashboard computes a weighted readiness score from résumé, internship, interview, and general tasks —
              with charts and real-time notifications when deadlines approach.
            </p>
            <ul className="cb-bullet-list">
              <li>
                <span className="cb-bullet-dot" /> High placement alignment via milestone completion
              </li>
              <li>
                <span className="cb-bullet-dot" /> Skills and progress visualized in one view
              </li>
            </ul>
          </div>
          <div className="cb-mock-panel">
            <div className="cb-mock-head">
              <span className="cb-mock-title">Performance overview</span>
              <span className="cb-mock-badge">Live data</span>
            </div>
            <div className="cb-mock-stats">
              <div>
                <div className="cb-mock-label">Placement rate</div>
                <div className="cb-mock-value">88.2%</div>
                <div className="cb-mock-bar">
                  <span style={{ width: "88%" }} />
                </div>
              </div>
              <div>
                <div className="cb-mock-label">Skill match</div>
                <div className="cb-mock-value">92.4%</div>
                <div className="cb-mock-bar">
                  <span className="cb-mock-bar-alt" style={{ width: "92%" }} />
                </div>
              </div>
            </div>
            <div className="cb-mock-chart" aria-hidden>
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="cb-mock-barcol" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cb-cta">
        <div className="cb-container cb-cta-inner">
          <h2>Ready to bridge the gap?</h2>
          <p>Open the résumé builder or analytics dashboard to explore CV tools and readiness tracking.</p>
          <div className="cb-cta-actions">
            <Link className="btn btn-cta-inverse" to="/resume">
              Open résumé builder
            </Link>
            <Link className="btn btn-cta-outline" to="/dashboard">
              View dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="cb-footer">
        <div className="cb-container cb-footer-grid">
          <div>
            <div className="cb-footer-brand">Career Bridge</div>
            <p className="cb-footer-mission">
              Connecting learning outcomes with career readiness through structured tools and clear analytics.
            </p>
            <div className="cb-social" aria-hidden>
              <span className="cb-social-dot" />
              <span className="cb-social-dot" />
              <span className="cb-social-dot" />
            </div>
          </div>
          <div>
            <h4 className="cb-footer-heading">Platform</h4>
            <ul className="cb-footer-links">
              <li>
                <Link to="/resume">CV/Resume</Link>
              </li>
              <li>
                <Link to="/dashboard">Analytics</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="cb-footer-heading">Resources</h4>
            <ul className="cb-footer-links">
              <li>
                <a href="#solutions">Solutions</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="cb-footer-heading">Legal</h4>
            <ul className="cb-footer-links">
              <li>
                <span className="muted">Demo project — ITPM</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="cb-container cb-footer-bottom">
          <span className="muted tiny">© {new Date().getFullYear()} Career Bridge · demo</span>
          <span className="cb-status">
            <span className="cb-status-dot" /> Systems operational
          </span>
        </div>
      </footer>
    </div>
  );
}
