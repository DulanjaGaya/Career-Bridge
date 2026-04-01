import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'

/**
 * HeroSection - Main landing page hero with CTA
 * Displays headline, description, and action buttons
 */
const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-dark-blue via-primary to-dark-blue flex items-center justify-center px-6 py-24">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Bridging the Gap Between
            <span className="gradient-text block">Education and Employment</span>
          </h1>
          
          <p className="text-xl text-gray-300 leading-relaxed">
            Career Bridge connects students, universities, and employers to create meaningful opportunities. Share knowledge, ask questions, and build the future together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/signup"
              className="bg-accent text-dark-blue px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-500 transition flex items-center justify-center gap-2 group"
            >
              Get Started
              <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
            </Link>
            <button className="border-2 border-accent text-accent px-8 py-4 rounded-lg font-bold text-lg hover:bg-accent/10 transition">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8">
            <div>
              <div className="text-3xl font-bold text-accent">10K+</div>
              <p className="text-gray-400">Students</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">500+</div>
              <p className="text-gray-400">Universities</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">2K+</div>
              <p className="text-gray-400">Employers</p>
            </div>
          </div>
        </div>

        {/* Right Image/Icon */}
        <div className="flex justify-center">
          <div className="glass-effect p-12 rounded-2xl">
            <Users size={300} className="text-accent" strokeWidth={0.5} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
