import { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, LogOut, Menu, X, ArrowRight } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = user 
        ? [
            { name: 'Dashboard', path: '/lobbies' },
            { name: 'Resources', path: '/resources' },
          ]
        : [
            { name: 'Home', path: '/' },
            { name: 'About Us', path: '/about' },
          ];

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-xl bg-brand-bg/80 border-b border-brand-border/50 shadow-sm' : 'bg-transparent border-b border-transparent'}`}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-primaryHover flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform duration-300">
                            <Briefcase size={22} className="text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-muted tracking-tight">
                            Career Bridge
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.name}
                                    to={link.path} 
                                    className={`relative px-1 py-2 text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-brand-primary' : 'text-brand-muted hover:text-white'}`}
                                >
                                    {link.name}
                                    {location.pathname === link.path && (
                                        <motion.div 
                                            layoutId="nav-indicator"
                                            className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-primary rounded-full"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>
                        
                        <div className="h-6 w-px bg-brand-border"></div>

                        <div className="flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-5">
                                    <div className="text-sm">
                                        <span className="text-brand-muted">Welcome, </span>
                                        <span className="font-semibold text-white">{user.name.split(' ')[0]}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2.5 rounded-full hover:bg-red-500/10 text-brand-muted hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20 group"
                                        title="Log Out"
                                    >
                                        <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-brand-muted hover:text-white transition-colors">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="group px-6 py-2.5 text-sm font-bold bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.35)] flex items-center gap-2">
                                        Get Started
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-brand-muted hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-brand-surface border-b border-brand-border overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.name}
                                    to={link.path} 
                                    className={`p-3 rounded-lg font-medium transition-colors ${location.pathname === link.path ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-muted hover:bg-brand-bg hover:text-white'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            
                            <hr className="border-brand-border my-2" />
                            
                            {user ? (
                                <div className="flex items-center justify-between p-3">
                                    <div className="text-sm">
                                        <span className="text-brand-muted">Signed in as</span><br/>
                                        <span className="font-semibold text-white">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-sm font-medium text-red-500 bg-red-500/10 px-4 py-2 rounded-lg"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link to="/login" className="p-3 text-center border border-brand-border rounded-xl font-medium text-brand-text hover:bg-brand-bg transition-colors">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="p-3 text-center bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
