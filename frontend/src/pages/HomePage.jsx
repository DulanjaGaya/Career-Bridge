import React from 'react'
import HeroSection from '../components/HeroSection'
import StakeholderCards from '../components/StakeholderCards'
import AnalyticsSection from '../components/AnalyticsSection'
import CTASection from '../components/CTASection'

/**
 * HomePage - Landing page with all main sections
 */
const HomePage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StakeholderCards />
      <AnalyticsSection />
      <CTASection />
    </div>
  )
}

export default HomePage
