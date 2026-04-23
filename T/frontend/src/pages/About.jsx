import { motion } from 'framer-motion';
import { Target, Users, BookOpen, Lightbulb } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-brand-bg py-20 px-4">
            <div className="container mx-auto max-w-5xl">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold text-white mb-6"
                    >
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-amber-500">Career Bridge</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-brand-muted max-w-3xl mx-auto leading-relaxed"
                    >
                        We're on a mission to democratize technical interview preparation. We believe that securing a job in tech shouldn't be about who you know, but what you know and how well you can demonstrate it.
                    </motion.p>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-bold text-white">Our Vision</h2>
                        <p className="text-brand-muted leading-relaxed text-lg">
                            Career Bridge was born from a simple observation: technical interviews are stressful, artificial environments that often fail to measure a candidate's true potential. 
                        </p>
                        <p className="text-brand-muted leading-relaxed text-lg">
                            We envisioned a platform where candidates could practice in realistic, timed conditions with peers, track their learning effectively, and build the confidence necessary to ace their interviews without paying thousands for coaching.
                        </p>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="bg-brand-surface border border-brand-border/50 p-6 rounded-2xl">
                            <Target className="text-brand-primary mb-4" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">10k+</h3>
                            <p className="text-brand-muted text-sm">Interviews Simulated</p>
                        </div>
                        <div className="bg-brand-surface border border-brand-border/50 p-6 rounded-2xl mt-8">
                            <Users className="text-blue-500 mb-4" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">50k+</h3>
                            <p className="text-brand-muted text-sm">Active Learners</p>
                        </div>
                        <div className="bg-brand-surface border border-brand-border/50 p-6 rounded-2xl">
                            <BookOpen className="text-emerald-500 mb-4" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">500+</h3>
                            <p className="text-brand-muted text-sm">Curated Resources</p>
                        </div>
                        <div className="bg-brand-surface border border-brand-border/50 p-6 rounded-2xl mt-8">
                            <Lightbulb className="text-amber-500 mb-4" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">24/7</h3>
                            <p className="text-brand-muted text-sm">Community Support</p>
                        </div>
                    </motion.div>
                </div>

                {/* Values Section */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-12">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="p-8 bg-brand-surface border border-brand-border/50 rounded-2xl hover:border-brand-primary/30 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-4">Accessibility First</h3>
                            <p className="text-brand-muted leading-relaxed">
                                Premium interview preparation shouldn't be locked behind expensive paywalls. We strive to provide enterprise-grade tools to everyone.
                            </p>
                        </div>
                        <div className="p-8 bg-brand-surface border border-brand-border/50 rounded-2xl hover:border-brand-primary/30 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-4">Community Driven</h3>
                            <p className="text-brand-muted leading-relaxed">
                                We learn better together. Our mock lobbies are designed to foster peer-to-peer coaching, feedback, and mutual growth.
                            </p>
                        </div>
                        <div className="p-8 bg-brand-surface border border-brand-border/50 rounded-2xl hover:border-brand-primary/30 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-4">Continuous Evolution</h3>
                            <p className="text-brand-muted leading-relaxed">
                                The tech industry moves fast, and so do we. We are constantly updating our question banks and resources to reflect modern standards.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
