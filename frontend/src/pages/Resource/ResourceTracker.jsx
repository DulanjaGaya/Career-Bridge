import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const ResourceTracker = () => {
    const [resources, setResources] = useState([]);
    const [summary, setSummary] = useState({ totalCompleted: 0, topics: {} });
    const [completedIds, setCompletedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [topicFilter, setTopicFilter] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const queryParams = new URLSearchParams();
                if (topicFilter) queryParams.append('topic', topicFilter);
                if (difficultyFilter) queryParams.append('difficulty', difficultyFilter);
                
                const [resResponse, progResponse] = await Promise.all([
                    api.get(`/resources?${queryParams.toString()}`),
                    api.get('/progress/summary')
                ]);

                setResources(resResponse.data);
                setSummary(progResponse.data.stats);
                setCompletedIds(progResponse.data.completedResourceIds);
            } catch (error) {
                toast.error('Failed to load resources and progress');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [topicFilter, difficultyFilter]);

    const handleToggleProgress = async (resourceId) => {
        try {
            const { data } = await api.post('/progress/toggle', { resourceId });
            
            if (data.status === 'completed') {
                setCompletedIds(prev => [...prev, resourceId]);
                toast.success('Marked as completed!', { style: { background: '#1E293B', color: '#10B981' } });
            } else {
                setCompletedIds(prev => prev.filter(id => id !== resourceId));
                toast('Marked as pending', { icon: '🔄', style: { background: '#1E293B', color: '#F8FAFC' } });
            }

            const progResponse = await api.get('/progress/summary');
            setSummary(progResponse.data.stats);

        } catch (error) {
            toast.error('Error updating progress');
        }
    };

    if (loading) return <div className="p-8 text-center text-brand-muted">Loading resources...</div>;

    const totalResources = resources.length;
    const completionPercentage = totalResources === 0 ? 0 : Math.round((completedIds.length / totalResources) * 100);

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <h1 className="text-3xl font-bold text-brand-text mb-6">Resource Tracker</h1>
            
            {/* Progress Summary Section */}
            <div className="bg-brand-surface rounded-xl shadow-lg border border-brand-border p-6 mb-8">
                <h2 className="text-xl font-bold text-brand-text mb-4">Your Progress</h2>
                
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <div className="w-full bg-brand-bg rounded-full h-4 overflow-hidden border border-brand-border flex-grow">
                        <div 
                            className="bg-gradient-to-r from-brand-primary to-brand-primaryHover h-4 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(249,115,22,0.8)]" 
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>
                    <span className="font-bold text-brand-text whitespace-nowrap text-lg px-4 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">{completionPercentage}% Total</span>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="bg-emerald-500/10 text-emerald-500 px-5 py-4 rounded-xl border border-emerald-500/20 min-w-[150px] shadow-sm">
                        <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-1">Items Completed</p>
                        <p className="text-3xl font-bold">{summary.totalCompleted}</p>
                    </div>
                    
                    {Object.entries(summary.topics).map(([topic, count]) => (
                        <div key={topic} className="bg-brand-bg text-brand-text px-5 py-4 rounded-xl border border-brand-border min-w-[150px] shadow-sm">
                            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">{topic}</p>
                            <p className="text-2xl font-bold">{count} <span className="text-sm font-normal text-brand-muted">done</span></p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <select 
                    value={topicFilter} 
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className="bg-brand-surface border border-brand-border text-brand-text rounded-lg px-4 py-3 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary font-sans shadow-sm"
                >
                    <option value="">All Topics</option>
                    <option value="DSA">DSA</option>
                    <option value="OOP">OOP</option>
                    <option value="System Design">System Design</option>
                    <option value="DBMS">DBMS</option>
                </select>
                
                <select 
                    value={difficultyFilter} 
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="bg-brand-surface border border-brand-border text-brand-text rounded-lg px-4 py-3 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary font-sans shadow-sm"
                >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            {/* Resources List */}
            {resources.length === 0 ? (
                <div className="text-center py-16 bg-brand-surface rounded-xl border border-brand-border shadow-sm">
                    <p className="text-brand-muted text-lg">No resources found matching those filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((resource) => {
                        const isCompleted = completedIds.includes(resource._id);
                        
                        return (
                            <div key={resource._id} className={`bg-brand-surface rounded-xl shadow border p-6 flex flex-col transition-all ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-brand-border hover:border-brand-primary/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-md tracking-wide">
                                        {resource.topic}
                                    </span>
                                    {isCompleted && (
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 flex items-center px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                                            ✓ Done
                                        </span>
                                    )}
                                </div>
                                
                                <h3 className="text-xl font-bold text-brand-text mb-3 leading-tight">{resource.title}</h3>
                                <p className="text-sm text-brand-muted mb-5 line-clamp-3 leading-relaxed flex-grow">{resource.description}</p>
                                
                                <div className="flex gap-2 mb-6">
                                    <span className="text-xs bg-brand-bg border text-brand-muted border-brand-border px-2 py-1.5 rounded capitalize font-medium">{resource.type}</span>
                                    <span className="text-xs bg-brand-bg border text-brand-muted border-brand-border px-2 py-1.5 rounded capitalize font-medium">{resource.difficulty}</span>
                                </div>

                                <div className="mt-auto flex justify-between items-center pt-5 border-t border-brand-border/50">
                                    <a 
                                        href={resource.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-brand-primary text-sm font-bold hover:text-brand-primaryHover flex items-center gap-1 group"
                                    >
                                        View Resource <span className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
                                    </a>
                                    
                                    <button 
                                        onClick={() => handleToggleProgress(resource._id)}
                                        className={`text-sm font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm ${isCompleted ? 'bg-brand-bg text-brand-muted border border-brand-border hover:text-brand-text' : 'bg-brand-primary text-white border border-brand-primaryHover hover:bg-brand-primaryHover hover:shadow-brand-primary/20 hover:shadow-lg'}`}
                                    >
                                        {isCompleted ? 'Undo' : 'Mark Done'}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default ResourceTracker;
