import React from 'react';
import { FileText } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="bg-brand-bg min-h-screen py-16 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
                        <FileText className="text-brand-primary" size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
                    <p className="text-brand-muted">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>

                <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 md:p-12 prose prose-invert max-w-none">
                    <p className="text-brand-muted text-lg leading-relaxed mb-8">
                        Welcome to Career Bridge. Please read these terms and conditions carefully before using our service.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-6 border-b border-brand-border/50 pb-4">1. Acceptance of Terms</h2>
                    <p className="text-brand-muted leading-relaxed mb-8">
                        By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-6 border-b border-brand-border/50 pb-4">2. User Account Obligations</h2>
                    <p className="text-brand-muted leading-relaxed mb-4">
                        In consideration of your use of the Service, you agree to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-8">
                        <li>Provide true, accurate, current and complete information about yourself as prompted by the Service's registration form.</li>
                        <li>Maintain and promptly update the Registration Data to keep it true, accurate, current and complete.</li>
                        <li>Maintain the security of your password and identification.</li>
                        <li>Accept all responsibility for any and all activities that occur under your account.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-6 border-b border-brand-border/50 pb-4">3. Conduct Rules</h2>
                    <p className="text-brand-muted leading-relaxed mb-4">
                        You understand that all information, data, text, software, music, sound, photographs, graphics, video, messages or other materials ("Content"), whether publicly posted or privately transmitted, are the sole responsibility of the person from which such Content originated. You agree to not use the Service to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-brand-muted mb-8">
                        <li>Upload, post, email, transmit or otherwise make available any Content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable.</li>
                        <li>Harm minors in any way.</li>
                        <li>Impersonate any person or entity.</li>
                        <li>Forge headers or otherwise manipulate identifiers in order to disguise the origin of any Content transmitted through the Service.</li>
                    </ul>


                    <h2 className="text-2xl font-bold text-white mt-12 mb-6 border-b border-brand-border/50 pb-4">4. Modifications to Service</h2>
                    <p className="text-brand-muted leading-relaxed mb-8">
                        Career Bridge reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. You agree that Career Bridge shall not be liable to you or to any third party for any modification, suspension or discontinuance of the Service.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-6 border-b border-brand-border/50 pb-4">5. Disclaimer of Warranties</h2>
                    <p className="text-brand-muted leading-relaxed mb-8">
                        You expressly understand and agree that your use of the service is at your sole risk. The service is provided on an "as is" and "as available" basis. Career Bridge expressly disclaims all warranties of any kind, whether express or implied, including, but not limited to the implied warranties of merchantability, fitness for a particular purpose and non-infringement.
                    </p>

                    <div className="bg-brand-bg border border-brand-border/50 p-6 rounded-xl mt-12 mb-2">
                        <h3 className="text-xl font-bold text-white mb-2">Contact Us</h3>
                        <p className="text-brand-muted">
                            If you have any questions about this Terms of Service, please contact us at: 
                            <a href="mailto:legal@careerbridge.com" className="text-brand-primary ml-2 hover:underline">legal@careerbridge.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
