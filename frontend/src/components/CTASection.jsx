import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * CTASection - Call-To-Action section encouraging signup
 */
const CTASection = () => {
  return (
    <section id="contact" className="py-24 px-6 bg-gradient-to-r from-primary to-dark-blue">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold">
          Ready to Bridge Your Career Gap?
        </h2>
        
        <p className="text-xl text-gray-300">
          Join thousands of students, universities, and employers already transforming careers through Career Bridge.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link
            to="/signup"
            className="bg-accent text-dark-blue px-10 py-4 rounded-lg font-bold text-lg hover:bg-orange-500 transition flex items-center justify-center gap-2 group"
          >
            Start Your Journey
            <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
          </Link>
          <Link
            to="/faq"
            className="border-2 border-accent text-accent px-10 py-4 rounded-lg font-bold text-lg hover:bg-accent/10 transition text-center"
          >
            Learn More
          </Link>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-300">
          <Link to="/qa" className="hover:text-white transition">
            Ask the community in Q&A
          </Link>
          <span className="hidden sm:inline text-gray-500">|</span>
          <Link to="/feedback" className="hover:text-white transition">
            Send feedback to the team
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CTASection
