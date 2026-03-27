import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-brand-surface border-b border-brand-border p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-xl font-bold text-brand-primary">
                        Career Bridge
                    </Link>
                    {user && (
                        <Link to="/lobbies" className="text-slate-600 font-medium hover:text-primary-600 transition-colors">
                            Lobbies
                        </Link>
                    )}
                </div>
                <div className="flex gap-4 items-center">
                    {user ? (
                        <>
                            <span className="text-brand-text font-medium">Hello, <span className="text-brand-primary">{user.name}</span></span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-md hover:bg-red-500/20 transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-brand-muted hover:text-brand-primary font-medium transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="bg-brand-primary text-white border border-brand-primaryHover px-6 py-2 rounded-md hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
