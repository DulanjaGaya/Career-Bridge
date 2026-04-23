import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Video, FileText, CheckCircle, Code, Briefcase, Users, LayoutDashboard, Target } from 'lucide-react';

const Home = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-4">
                <div className="absolute inset-0 bg-brand-bg">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-primary/20 via-brand-bg to-brand-bg opacity-70"></div>
                </div>
                
                <div className="container mx-auto relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary mb-8 font-medium text-sm">
                            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                            Platform is live and operational
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
                            Master your interviews.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-amber-500">
                                Land your dream job.
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-brand-muted mb-10 max-w-2xl mx-auto leading-relaxed">
                            Career Bridge provides an elite environment for practicing technical interviews, tracking your learning resources, and collaborating in real-time mock lobbies.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link 
                                to="/register" 
                                className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 group"
                            >
                                Start Practicing Free
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                            <Link 
                                to="/lobbies" 
                                className="w-full sm:w-auto px-8 py-4 bg-brand-surface hover:bg-brand-bg text-white font-bold rounded-xl transition-all border border-brand-border/50 hover:border-brand-border flex items-center justify-center"
                            >
                                View Mock Lobbies
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-brand-surface/50 border-t border-brand-border/50 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for top performers</h2>
                        <p className="text-brand-muted text-lg max-w-2xl mx-auto">
                            Everything you need to prepare for technical interviews at FAANG and top tier tech companies in one unified platform.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-brand-surface border border-brand-border/50 rounded-2xl p-8 hover:border-brand-primary/50 transition-colors group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Users className="text-blue-500" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Live Mock Lobbies</h3>
                            <p className="text-brand-muted leading-relaxed mb-6">
                                Join collaborative interview rooms. Practice technical questions under time pressure with your peers or mentors in real-time.
                            </p>
                            <ul className="space-y-2 text-sm text-brand-muted">
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Timed sessions</li>
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Host controls</li>
                            </ul>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-brand-surface border border-brand-border/50 rounded-2xl p-8 hover:border-brand-primary/50 transition-colors group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <LayoutDashboard className="text-brand-primary" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Resource Tracker</h3>
                            <p className="text-brand-muted leading-relaxed mb-6">
                                Centralize your learning. Save and organize YouTube videos, PDFs, and articles with our intelligent resource tracking system.
                            </p>
                            <ul className="space-y-2 text-sm text-brand-muted">
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Embedded video player</li>
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Categorized topics</li>
                            </ul>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-brand-surface border border-brand-border/50 rounded-2xl p-8 hover:border-brand-primary/50 transition-colors group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Target className="text-purple-500" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Real-time Scoreboards</h3>
                            <p className="text-brand-muted leading-relaxed mb-6">
                                Compare your performance. Our real-time scoring system evaluates your answers and updates the room leaderboards instantly.
                            </p>
                            <ul className="space-y-2 text-sm text-brand-muted">
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Instant feedback</li>
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Progress analytics</li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-primary/5"></div>
                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to elevate your career?</h2>
                    <p className="text-brand-muted text-lg mb-10 max-w-2xl mx-auto">
                        Join thousands of developers using Career Bridge to master their interviewing skills and land offers at top tech companies.
                    </p>
                    <Link 
                        to="/register" 
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-bg hover:bg-gray-100 font-bold rounded-xl transition-colors shadow-lg"
                    >
                        Create your free account
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
