import React from 'react'
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

/**
 * Footer - Site footer with company info and social links
 */
const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-blue border-t border-accent/20 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">Career Bridge</h3>
            <p className="text-gray-400">
              Connecting education and employment to build better futures.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-accent transition">Home</a></li>
              <li><a href="#features" className="hover:text-accent transition">Features</a></li>
              <li><a href="#contact" className="hover:text-accent transition">Contact</a></li>
              <li><a href="/blog" className="hover:text-accent transition">Blog</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-accent transition">Documentation</a></li>
              <li><a href="#" className="hover:text-accent transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-accent transition">FAQs</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-accent transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-accent/20 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Career Bridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
