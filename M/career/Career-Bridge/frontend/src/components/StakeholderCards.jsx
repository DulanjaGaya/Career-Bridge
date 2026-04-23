import React from 'react'
import { Users, Building, Briefcase } from 'lucide-react'

/**
 * StakeholderCards - Displays three main stakeholders joined by Career Bridge
 * Shows how each group (students, universities, employers) benefits
 */
const StakeholderCards = () => {
  const stakeholders = [
    {
      title: 'Students',
      icon: Users,
      description: 'Access career guidance, job opportunities, and connect with industry professionals.',
      benefits: ['Career Resources', 'Internships', 'Networking']
    },
    {
      title: 'Universities',
      icon: Building,
      description: 'Bridge the gap between academic learning and industry expectations.',
      benefits: ['Link to Industry', 'Placements', 'Student Success']
    },
    {
      title: 'Employers',
      icon: Briefcase,
      description: 'Find talented fresh graduates and build a strong talent pipeline.',
      benefits: ['Top Talent', 'Recruitment', 'Partnerships']
    }
  ]

  return (
    <section className="py-24 px-6 bg-dark-blue">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 gradient-text">Everyone Benefits</h2>
        <p className="text-center text-gray-300 mb-16 text-lg">
          Career Bridge creates a unified ecosystem where all stakeholders win
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {stakeholders.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="glass-effect p-8 rounded-xl card-hover text-center"
              >
                <Icon className="text-accent mx-auto mb-4" size={48} />
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-300 mb-6">{item.description}</p>
                
                <div className="space-y-2">
                  {item.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center justify-center gap-2 text-accent">
                      <span className="w-2 h-2 bg-accent rounded-full"></span>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default StakeholderCards
