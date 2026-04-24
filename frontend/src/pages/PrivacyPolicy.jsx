import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="bg-brand-bg min-h-screen py-16 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Shield className="text-brand-primary" size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
                    <p className="text-brand-muted">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>

                <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 md:p-12 prose prose-invert max-w-none">
                    <p className="text-brand-muted text-lg leading-relaxed mb-8">
                        Welcome to Career Bridge. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-6 border-b border-brand-border/50 pb-4">1. Information We Collect</h2>
                    <p className="text-brand-muted leading-relaxed mb-4">
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-8">
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
                        <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
                        <li><strong>Profile Data</strong> includes your username and password, test scores, resources saved, and your interests.</li>
                        <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-6 border-b border-brand-border/50 pb-4">2. How We Use Your Data</h2>
                    <p className="text-brand-muted leading-relaxed mb-4">
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-8">
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., providing lobby access).</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal or regulatory obligation.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-6 border-b border-brand-border/50 pb-4">3. Data Security</h2>
                    <p className="text-brand-muted leading-relaxed mb-8">
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-6 border-b border-brand-border/50 pb-4">4. Your Legal Rights</h2>
                    <p className="text-brand-muted leading-relaxed mb-4">
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data. You have the right to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-8">
                        <li>Request access to your personal data.</li>
                        <li>Request correction of your personal data.</li>
                        <li>Request erasure of your personal data.</li>
                        <li>Object to processing of your personal data.</li>
                        <li>Request restriction of processing your personal data.</li>
                    </ul>

                    <div className="bg-brand-bg border border-brand-border/50 p-6 rounded-xl mt-12">
                        <h3 className="text-xl font-bold text-white mb-2">Contact Us</h3>
                        <p className="text-brand-muted">
                            If you have any questions about this privacy policy or our privacy practices, please contact our data privacy manager at: 
                            <a href="mailto:privacy@careerbridge.com" className="text-brand-primary ml-2 hover:underline">privacy@careerbridge.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
