import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-surface border-t border-brand-border py-12 px-6 mt-auto shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-brand-primary mb-4">Career Bridge</h3>
            <p className="text-brand-muted">
              Connecting education and employment to build better futures.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-brand-text">Platform</h4>
            <ul className="space-y-2 text-brand-muted">
              <li><a href="/" className="hover:text-brand-primary transition">For Students</a></li>
              <li><a href="#" className="hover:text-brand-primary transition">For Universities</a></li>
              <li><a href="#" className="hover:text-brand-primary transition">For Employers</a></li>
              <li><a href="/lobbies" className="hover:text-brand-primary transition">Mock Lobbies</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-brand-text">Resources</h4>
            <ul className="space-y-2 text-brand-muted">
              <li><a href="/resources" className="hover:text-brand-primary transition">Resource Tracker</a></li>
              <li><a href="#" className="hover:text-brand-primary transition">Documentation</a></li>
              <li><a href="#" className="hover:text-brand-primary transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-primary transition">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-brand-text">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-brand-muted hover:text-brand-primary transition bg-brand-bg p-2 rounded-full border border-brand-border">
                {/* LinkedIn */}
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
              </a>
              <a href="#" className="text-brand-muted hover:text-brand-primary transition bg-brand-bg p-2 rounded-full border border-brand-border">
                {/* X / Twitter */}
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </a>
              <a href="#" className="text-brand-muted hover:text-brand-primary transition bg-brand-bg p-2 rounded-full border border-brand-border">
                {/* YouTube */}
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-border/50 pt-8 flex flex-col md:flex-row justify-between items-center text-brand-muted text-sm px-4">
          <p>&copy; {currentYear} Career Bridge. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span>Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
