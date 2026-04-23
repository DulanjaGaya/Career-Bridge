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
          <button className="border-2 border-accent text-accent px-10 py-4 rounded-lg font-bold text-lg hover:bg-accent/10 transition">
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}

export default CTASection
