import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  FiBriefcase, FiUsers, FiTrendingUp, FiArrowRight, 
  FiCheckCircle, FiBarChart2, FiAward
} from 'react-icons/fi';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: FiBriefcase,
      title: 'Students',
      description: 'Discover personalized career paths based on your academic profile and real-time market demand.',
      linkText: 'Explore Careers',
      link: '/browse-jobs'
    },
    {
      icon: FiAward,
      title: 'Universities',
      description: 'Align your curriculum with industry standards and track long-term alumni placement success.',
      linkText: 'Institutional Dashboard',
      link: '/register/student'
    },
    {
      icon: FiUsers,
      title: 'Employers',
      description: 'Access a verified pipeline of top-tier talent equipped with the specific skills your organization needs.',
      linkText: 'Talent Solutions',
      link: '/register'
    }
  ];

  return (
    <div className="min-h-screen bg-dark-base text-slate-200 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-900/10 rounded-bl-[100px] blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-900/10 rounded-tr-[100px] blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <p className="text-primary-500 font-bold tracking-wider uppercase text-sm mb-4">The Future of Workforce Readiness</p>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                Bridging the Gap Between <span className="text-primary-500">Education</span> and Employment
              </h1>
              <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-lg">
                A centralized platform connecting academic excellence with industrial demand through precision data and AI-driven skill matching.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {!user ? (
                  <>
                    <Link
                      to="/register/student"
                      className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2"
                    >
                      Get Started <FiArrowRight />
                    </Link>
                    <Link
                      to="/browse-jobs"
                      className="bg-dark-card/50 border border-slate-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-dark-card hover:border-slate-500 transition flex items-center justify-center gap-2"
                    >
                      Browse Jobs
                    </Link>
                  </>
                ) : (
                  <Link
                    to={user.role === 'student' ? "/student/dashboard" : "/employer/dashboard"}
                    className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2"
                  >
                    Go to Dashboard <FiArrowRight />
                  </Link>
                )}
              </div>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-transparent rounded-2xl transform rotate-3 scale-105 blur-lg px-2"></div>
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-dark-card">
                <div className="aspect-[4/3] flex items-center justify-center p-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                   
                   {/* Abstract Dashboard UI graphic */}
                   <div className="grid grid-cols-2 gap-6 w-full z-10">
                      <div className="bg-dark-base p-6 rounded-xl border border-slate-800/50 shadow-inner">
                         <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center mb-4 text-primary-500"><FiTrendingUp className="w-6 h-6"/></div>
                         <div className="text-3xl font-bold text-white mb-1">94%</div>
                         <div className="text-sm text-slate-400">Placement Accuracy</div>
                      </div>
                      <div className="bg-dark-base p-6 rounded-xl border border-slate-800/50 shadow-inner translate-y-8">
                         <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-500"><FiCheckCircle className="w-6 h-6"/></div>
                         <div className="text-3xl font-bold text-white mb-1">10k+</div>
                         <div className="text-sm text-slate-400">Employers Connected</div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="border-y border-slate-800/50 bg-dark-base/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Trusted By World-Class Institutions</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-slate-700"></div><span className="font-bold text-lg text-slate-300">TechCorp</span></div>
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-slate-700"></div><span className="font-bold text-lg text-slate-300">Innovate.ai</span></div>
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-slate-700"></div><span className="font-bold text-lg text-slate-300">Global Systems</span></div>
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-slate-700"></div><span className="font-bold text-lg text-slate-300">EduTech Solutions</span></div>
          </div>
        </div>
      </div>

      {/* Tailored Solutions Section */}
      <div className="py-24 bg-dark-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tailored Solutions for Every Stakeholder</h2>
            <div className="w-20 h-1 bg-primary-500 mb-6 border-none rounded"></div>
            <p className="text-slate-400 text-lg">
              Whether you are building a career, a curriculum, or a workforce, our platform provides the structural integrity needed to succeed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-dark-card border border-slate-800 rounded-2xl p-8 hover:border-primary-500/50 hover:shadow-2xl hover:shadow-primary-600/10 transition-all duration-300 group flex flex-col h-full"
              >
                <div className="w-12 h-12 bg-dark-base border border-slate-700 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary-500/10 group-hover:border-primary-500/30 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 flex-grow mb-8 leading-relaxed">{feature.description}</p>
                <Link to={feature.link} className="mt-auto text-primary-500 font-semibold group-hover:text-primary-400 transition-colors inline-flex items-center gap-2">
                  {feature.linkText}
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Section */}
      <div className="py-24 bg-dark-card border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary-500 font-bold tracking-wider uppercase text-sm mb-4">Precision Analytics</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Data-Driven Decisions for the Future of Work</h2>
              <p className="text-slate-400 text-lg mb-8">
                Our proprietary Analytics Engine translates raw educational data into actionable insights. Monitor placement rates, identify skill gaps, and forecast industry trends with unrivaled accuracy.
              </p>
              <ul className="space-y-6">
                 <li className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-dark-base border border-slate-700 flex items-center justify-center text-primary-500">
                       <FiBarChart2 className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="text-white font-bold text-lg">Real-time Market Insights</h4>
                       <p className="text-slate-500 text-sm mt-1">Dynamic skill taxonomy that evolves with technological shifts.</p>
                    </div>
                 </li>
                 <li className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-dark-base border border-slate-700 flex items-center justify-center text-primary-500">
                       <FiTrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="text-white font-bold text-lg">Predictive Modeling</h4>
                       <p className="text-slate-500 text-sm mt-1">Predictive modeling for successful candidate matching across 40+ industries.</p>
                    </div>
                 </li>
              </ul>
            </div>
            
            <div className="bg-dark-base rounded-2xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary-600/20 blur-2xl rounded-full"></div>
               <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                 <h3 className="text-white font-semibold flex items-center gap-2"><FiBarChart2/> Performance Overview</h3>
                 <span className="px-2 py-1 bg-primary-500/10 text-primary-500 text-xs font-bold rounded">Live Data</span>
               </div>
               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-dark-card p-4 rounded-xl border border-slate-800">
                     <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Placement Rate</p>
                     <p className="text-3xl font-bold text-white">88.2%</p>
                     <div className="w-full h-1 bg-slate-700 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 w-[88%] rounded-full"></div>
                     </div>
                  </div>
                  <div className="bg-dark-card p-4 rounded-xl border border-slate-800">
                     <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Skills Match</p>
                     <p className="text-3xl font-bold text-white">92.4%</p>
                     <div className="w-full h-1 bg-slate-700 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[92%] rounded-full"></div>
                     </div>
                  </div>
               </div>
               
               {/* Decorative Bar Chart */}
               <div className="h-32 flex items-end justify-between gap-2 border-b border-slate-800 pb-2 relative">
                  <div className="absolute inset-0 grid grid-rows-4">
                     <div className="border-t border-slate-800/30 w-full h-full"></div>
                     <div className="border-t border-slate-800/30 w-full h-full"></div>
                     <div className="border-t border-slate-800/30 w-full h-full"></div>
                     <div className="border-t border-slate-800/30 w-full h-full"></div>
                  </div>
                  <div className="w-full bg-primary-600/40 hover:bg-primary-500 transition-colors h-[40%] rounded-t relative z-10"></div>
                  <div className="w-full bg-primary-600/60 hover:bg-primary-500 transition-colors h-[70%] rounded-t relative z-10"></div>
                  <div className="w-full bg-primary-600/30 hover:bg-primary-500 transition-colors h-[30%] rounded-t relative z-10"></div>
                  <div className="w-full bg-primary-500 hover:bg-primary-400 transition-colors h-[90%] rounded-t relative z-10 shadow-[0_0_15px_rgba(249,115,22,0.4)]"></div>
                  <div className="w-full bg-primary-600/70 hover:bg-primary-500 transition-colors h-[60%] rounded-t relative z-10"></div>
                  <div className="w-full bg-primary-600/50 hover:bg-primary-500 transition-colors h-[45%] rounded-t relative z-10"></div>
                  <div className="w-full bg-primary-600/80 hover:bg-primary-500 transition-colors h-[75%] rounded-t relative z-10"></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA Section */}
      <div className="py-24 bg-dark-base relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
           <div className="w-[800px] h-[800px] border-[50px] border-primary-900/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-[2rem] p-10 md:p-16 text-center shadow-2xl shadow-primary-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
              Ready to bridge the gap?
            </h2>
            <p className="text-primary-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10">
              Join leading universities and employers worldwide using Career Bridge to build the future workforce.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link
                to="/register"
                className="bg-dark-base text-white hover:bg-slate-900 px-8 py-4 rounded-xl font-bold transition shadow-lg text-lg border border-slate-800"
              >
                Create Institutional Account
              </Link>
              <Link
                to="/register/student"
                className="bg-white text-primary-600 hover:bg-slate-100 px-8 py-4 rounded-xl font-bold transition shadow-lg text-lg"
              >
                Student Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;