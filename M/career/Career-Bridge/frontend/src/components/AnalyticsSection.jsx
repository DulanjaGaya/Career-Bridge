import React from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

/**
 * AnalyticsSection - Displays platform statistics using charts
 * Shows data insights with interactive charts
 */
const AnalyticsSection = () => {
  // Sample data for charts
  const placementData = [
    { month: 'Jan', placements: 40, offers: 24 },
    { month: 'Feb', placements: 60, offers: 34 },
    { month: 'Mar', placements: 55, offers: 29 },
    { month: 'Apr', placements: 75, offers: 45 },
    { month: 'May', placements: 85, offers: 60 },
    { month: 'Jun', placements: 95, offers: 70 }
  ]

  const roleDistribution = [
    { name: 'Software Dev', value: 35 },
    { name: 'Data Science', value: 25 },
    { name: 'Design', value: 20 },
    { name: 'Others', value: 20 }
  ]

  const colors = ['#FF8C00', '#1e3a8a', '#3b82f6', '#06b6d4']

  const stats = [
    { label: 'Average Placement Time', value: '3.2 months' },
    { label: 'Student Satisfaction', value: '98%' },
    { label: 'Job Match Rate', value: '94%' }
  ]

  return (
    <section id="analytics" className="py-24 px-6 bg-primary">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Platform Analytics</h2>
        <p className="text-center text-gray-300 mb-16">
          Real data. Real impact. Real careers built.
        </p>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="glass-effect p-6 rounded-lg text-center">
              <p className="text-gray-300 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-accent">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Line Chart - Placements Over Time */}
          <div className="glass-effect p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-6">Placements Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={placementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="placements" stroke="#FF8C00" strokeWidth={2} />
                <Line type="monotone" dataKey="offers" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Role Distribution */}
          <div className="glass-effect p-6 rounded-lg flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-6 w-full">Job Role Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#FF8C00"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsSection
