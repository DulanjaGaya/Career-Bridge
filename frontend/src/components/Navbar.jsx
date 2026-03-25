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
        <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-xl font-bold text-primary-600">
                        InterviewPrep
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
                            <span className="text-gray-600 font-medium">Hello, {user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
