import React from 'react'
import { Globe, Mail, ExternalLink, Users } from 'lucide-react'

/**
 * Footer - Site footer with company info and social links
 */
const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 border-t border-primary-500/20 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-primary-500 mb-4">Career Bridge</h3>
            <p className="text-gray-400">
              Connecting education and employment to build better futures.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-primary-400">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-primary-400 transition">Home</a></li>
              <li><a href="#features" className="hover:text-primary-400 transition">Features</a></li>
              <li><a href="#contact" className="hover:text-primary-400 transition">Contact</a></li>
              <li><a href="/blog" className="hover:text-primary-400 transition">Blog</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold mb-4 text-primary-400">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-primary-400 transition">Documentation</a></li>
              <li><a href="#" className="hover:text-primary-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-400 transition">FAQs</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-bold mb-4 text-primary-400">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <Globe size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <Mail size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <ExternalLink size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <Users size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-primary-500/20 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Career Bridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
