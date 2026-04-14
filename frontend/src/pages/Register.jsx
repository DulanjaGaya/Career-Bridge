import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await signup(name, email, password);
            if (result.success) {
                toast.success('Account created successfully!', { style: { background: '#1E293B', color: '#10B981' } });
                navigate('/');
            } else {
                toast.error(result.error || 'Registration failed', { style: { background: '#1E293B', color: '#F8FAFC' } });
                setIsLoading(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed', { style: { background: '#1E293B', color: '#F8FAFC' } });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-brand-surface p-8 sm:p-10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-brand-border w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-brand-text tracking-tight mb-2">Create Account</h2>
                    <p className="text-brand-muted">Join Career Bridge to start practicing.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5 ml-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-inner"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5 ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-inner"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-inner"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="group w-full bg-gradient-to-r from-brand-primary to-brand-primaryHover text-white font-bold py-3.5 rounded-xl transition-all mt-4 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                        {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /> }
                    </button>
                </form>
                
                <p className="mt-8 text-center text-brand-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-primary font-semibold hover:text-brand-primaryHover transition-colors">
                        Log in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
