import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

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
            toast.success('Joined lobby successfully!');
            navigate(`/lobbies/${lobbyId}`);
        } catch (error) {
            if (error.response?.data?.message === 'You are already in this lobby') {
                navigate(`/lobbies/${lobbyId}`);
            } else {
                toast.error(error.response?.data?.message || 'Error joining lobby');
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading active lobbies...</div>;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Mock Interview Lobbies</h1>
                    <p className="text-slate-500 mt-1">Join an active room to practice interview questions in real-time.</p>
                </div>
                <button
                    onClick={() => navigate('/lobbies/create')}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors"
                >
                    + Create Room
                </button>
            </div>

            {lobbies.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
                    <p className="text-slate-500 mb-4">No active interview rooms available right now.</p>
                    <button
                        onClick={() => navigate('/lobbies/create')}
                        className="text-primary-600 font-medium hover:underline"
                    >
                        Be the first to create one!
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lobbies.map((lobby) => (
                        <div key={lobby._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-3 py-1 rounded-full uppercase tracking-wider">
                                    {lobby.topic}
                                </span>
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                    {lobby.members.length} / {lobby.maxMembers}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 truncate" title={lobby.title}>
                                {lobby.title}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4 flex-grow line-clamp-2">
                                {lobby.description || 'No description provided.'}
                            </p>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                                <span className="text-sm text-slate-500">Host: <span className="font-medium text-slate-700">{lobby.host.name}</span></span>
                                <button
                                    onClick={() => handleJoin(lobby._id)}
                                    disabled={lobby.members.length >= lobby.maxMembers && lobby.host._id !== user._id}
                                    className="bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium py-1.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Join Room
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LobbyList;
