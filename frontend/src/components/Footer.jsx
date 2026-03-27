import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-surface border-t border-brand-border/50 pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-primaryHover flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                    <Briefcase size={16} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                    Career Bridge
                </span>
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed mb-6">
              Empowering the next generation of professionals with real-world practice, resources, and mock interviews to excel in tech careers.
            </p>
            <div className="flex gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-brand-muted hover:text-white transition-colors bg-brand-bg p-2.5 rounded-xl border border-brand-border/50 hover:border-brand-primary/30 hover:bg-brand-primary/10">
                <LinkedinIcon />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-brand-muted hover:text-white transition-colors bg-brand-bg p-2.5 rounded-xl border border-brand-border/50 hover:border-brand-primary/30 hover:bg-brand-primary/10">
                <TwitterIcon />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-brand-muted hover:text-white transition-colors bg-brand-bg p-2.5 rounded-xl border border-brand-border/50 hover:border-brand-primary/30 hover:bg-brand-primary/10">
                <GithubIcon />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white text-sm tracking-widest uppercase">Platform</h4>
            <ul className="space-y-3 text-sm text-brand-muted">
              <li><Link to="/lobbies" className="hover:text-brand-primary transition-colors">Mock Lobbies</Link></li>
              <li><Link to="/resources" className="hover:text-brand-primary transition-colors">Resource Tracker</Link></li>
              <li><Link to="/" className="hover:text-brand-primary transition-colors">For Students</Link></li>
              <li><Link to="/" className="hover:text-brand-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white text-sm tracking-widest uppercase">Company</h4>
            <ul className="space-y-3 text-sm text-brand-muted">
              <li><Link to="/about" className="hover:text-brand-primary transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-brand-primary transition-colors">Careers</Link></li>
              <li><Link to="/" className="hover:text-brand-primary transition-colors">Blog</Link></li>
              <li><Link to="/" className="hover:text-brand-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white text-sm tracking-widest uppercase">Legal</h4>
            <ul className="space-y-3 text-sm text-brand-muted">
              <li><Link to="/privacy" className="hover:text-brand-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-brand-primary transition-colors">Cookie Policy</Link></li>
              <li><Link to="/" className="hover:text-brand-primary transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-border/50 pt-8 flex flex-col md:flex-row justify-between items-center text-brand-muted text-sm gap-4">
          <p>&copy; {currentYear} Career Bridge Platform. All rights reserved.</p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="font-medium text-xs">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
