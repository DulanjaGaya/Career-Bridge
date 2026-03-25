import React from 'react'
import { Globe, Mail, ExternalLink, Users } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

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
            <h4 className="font-bold mb-4 text-brand-text">Quick Links</h4>
            <ul className="space-y-2 text-brand-muted">
              <li><a href="/" className="hover:text-brand-primary transition">Home</a></li>
              <li><a href="#features" className="hover:text-brand-primary transition">Features</a></li>
              <li><a href="#contact" className="hover:text-brand-primary transition">Contact</a></li>
              <li><a href="/blog" className="hover:text-brand-primary transition">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-brand-text">Resources</h4>
            <ul className="space-y-2 text-brand-muted">
              <li><a href="#" className="hover:text-brand-primary transition">Documentation</a></li>
              <li><a href="#" className="hover:text-brand-primary transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-primary transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-primary transition">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-brand-text">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-brand-muted hover:text-brand-primary transition">
                <Globe size={20} />
              </a>
              <a href="#" className="text-brand-muted hover:text-brand-primary transition">
                <Mail size={20} />
              </a>
              <a href="#" className="text-brand-muted hover:text-brand-primary transition">
                <ExternalLink size={20} />
              </a>
              <a href="#" className="text-brand-muted hover:text-brand-primary transition">
                <Users size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-border/50 pt-8 text-center text-brand-muted text-sm">
          <p>&copy; {currentYear} Career Bridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
