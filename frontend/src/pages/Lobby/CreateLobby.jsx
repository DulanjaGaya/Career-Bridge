import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

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
                className="text-brand-muted hover:text-brand-primary mb-6 flex items-center font-medium transition-colors"
            >
                ← Back to Lobbies
            </button>
            
            <div className="bg-brand-surface rounded-xl shadow-lg border border-brand-border p-8">
                <h1 className="text-2xl font-bold text-brand-text mb-6 border-b border-brand-border pb-4">Create Mock Interview Room</h1>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1">Room Title <span className="text-brand-primary">*</span></label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-sans placeholder-brand-muted/50"
                            placeholder="e.g., Evening DSA Practice Session"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1">Topic <span className="text-brand-primary">*</span></label>
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-sans"
                        >
                            <option value="DSA">Data Structures & Algorithms (DSA)</option>
                            <option value="OOP">Object-Oriented Programming (OOP)</option>
                            <option value="DBMS">Database Management (DBMS)</option>
                            <option value="System Design">System Design</option>
                            <option value="HR">Behavioral / HR</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-sans resize-none placeholder-brand-muted/50"
                            placeholder="Optional... Let others know what to expect."
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1">Maximum Participants</label>
                        <input
                            type="number"
                            min="2"
                            max="20"
                            value={maxMembers}
                            onChange={(e) => setMaxMembers(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-sans"
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-brand-primary text-white font-medium py-3 rounded-lg hover:bg-brand-primaryHover border border-brand-primaryHover shadow-lg shadow-brand-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
