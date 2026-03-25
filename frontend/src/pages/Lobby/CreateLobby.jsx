import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/axios';

const CreateLobby = () => {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('DSA');
    const [description, setDescription] = useState('');
    const [maxMembers, setMaxMembers] = useState(5);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/lobbies', {
                title,
                topic,
                description,
                maxMembers
            });
            toast.success('Room created successfully!');
            navigate(`/lobbies/${data._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating lobby');
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <button 
                onClick={() => navigate('/lobbies')}
                className="text-slate-500 hover:text-slate-800 mb-6 flex items-center font-medium transition-colors"
            >
                ← Back to Lobbies
            </button>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Create Mock Interview Room</h1>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Room Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-sans"
                            placeholder="e.g., Evening DSA Practice Session"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Topic <span className="text-red-500">*</span></label>
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-white font-sans"
                        >
                            <option value="DSA">Data Structures & Algorithms (DSA)</option>
                            <option value="OOP">Object-Oriented Programming (OOP)</option>
                            <option value="DBMS">Database Management (DBMS)</option>
                            <option value="System Design">System Design</option>
                            <option value="HR">Behavioral / HR</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-sans resize-none"
                            placeholder="Optional... Let others know what to expect."
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Participants</label>
                        <input
                            type="number"
                            min="2"
                            max="20"
                            value={maxMembers}
                            onChange={(e) => setMaxMembers(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-sans"
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Start Interview Room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateLobby;
