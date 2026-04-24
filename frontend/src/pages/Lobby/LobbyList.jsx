import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Hash, Plus, Users } from 'lucide-react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const SkeletonCard = () => (
    <div className="bg-brand-surface rounded-xl border border-brand-border p-6 flex flex-col animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="h-6 w-16 bg-brand-border rounded-md"></div>
            <div className="h-6 w-14 bg-brand-bg rounded-md"></div>
        </div>
        <div className="h-6 w-3/4 bg-brand-border rounded mb-2"></div>
        <div className="h-4 w-full bg-brand-bg rounded mb-1"></div>
        <div className="h-4 w-2/3 bg-brand-bg rounded mb-6"></div>
        <div className="pt-5 border-t border-brand-border/50 flex justify-between items-center mt-auto">
            <div className="h-4 w-24 bg-brand-bg rounded"></div>
            <div className="h-8 w-16 bg-brand-border rounded-lg"></div>
        </div>
    </div>
);

const LobbyList = () => {
    const [lobbies, setLobbies] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLobbies = async () => {
            try {
                const { data } = await api.get('/lobbies');
                setLobbies(data);
            } catch (error) {
                toast.error('Failed to load lobbies');
            } finally {
                setLoading(false);
            }
        };

        fetchLobbies();
    }, []);

    const handleJoin = async (lobbyId) => {
        try {
            await api.post(`/lobbies/${lobbyId}/join`);
            navigate(`/lobbies/${lobbyId}`);
        } catch (error) {
            if (error.response?.data?.message === 'You are already in this lobby') {
                navigate(`/lobbies/${lobbyId}`);
            } else {
                toast.error(error.response?.data?.message || 'Error joining lobby', { style: { background: '#1E293B', color: '#F8FAFC' } });
            }
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-text mb-1 tracking-tight">Mock Interview Lobbies</h1>
                    <p className="text-brand-muted">Join an active room to practice interview questions in real-time.</p>
                </div>
                <button
                    onClick={() => navigate('/lobbies/create')}
                    className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-primaryHover text-white font-bold py-2.5 px-6 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all"
                >
                    <Plus size={18} />
                    <span>Create Room</span>
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : lobbies.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-surface rounded-2xl border border-brand-border p-16 text-center shadow-lg"
                >
                    <div className="mx-auto w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mb-4 border border-brand-border">
                        <Hash className="text-brand-muted" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-brand-text mb-2">No Active Rooms</h3>
                    <p className="text-brand-muted mb-6">There are currently no interview practice rooms available.</p>
                    <button
                        onClick={() => navigate('/lobbies/create')}
                        className="text-brand-primary font-medium hover:text-brand-primaryHover transition-colors"
                    >
                        Be the first to create one! →
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lobbies.map((lobby, i) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            key={lobby._id} 
                            className="group bg-brand-surface rounded-xl border border-brand-border p-6 flex flex-col hover:border-brand-primary/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-md uppercase tracking-wide">
                                    {lobby.topic}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-bold text-brand-muted bg-brand-bg px-2.5 py-1 rounded-md border border-brand-border">
                                    <Users size={12} /> {lobby.members.length} / {lobby.maxMembers}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-brand-text mb-2 truncate" title={lobby.title}>
                                {lobby.title}
                            </h3>
                            <p className="text-sm text-brand-muted mb-6 flex-grow line-clamp-2 leading-relaxed">
                                {lobby.description || 'No description provided.'}
                            </p>
                            <div className="pt-5 border-t border-brand-border/50 flex justify-between items-center mt-auto">
                                <span className="text-xs text-brand-muted uppercase tracking-wide font-semibold">
                                    Host: <span className="text-brand-text normal-case tracking-normal text-sm font-medium ml-1">{lobby.host.name}</span>
                                </span>
                                <button
                                    onClick={() => handleJoin(lobby._id)}
                                    disabled={lobby.members.length >= lobby.maxMembers && lobby.host._id !== user._id}
                                    className="bg-brand-bg group-hover:bg-brand-primary text-brand-primary group-hover:text-white border border-brand-border group-hover:border-brand-primaryHover font-medium py-1.5 px-5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:group-hover:bg-brand-bg disabled:group-hover:text-brand-primary disabled:group-hover:border-brand-border shadow-sm"
                                >
                                    Join
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LobbyList;
