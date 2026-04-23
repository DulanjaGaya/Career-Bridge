import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import StakeholderCards from '../components/StakeholderCards'
import AnalyticsSection from '../components/AnalyticsSection'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

/**
 * HomePage - Landing page with all main sections
 */
const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StakeholderCards />
      <AnalyticsSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default HomePage
