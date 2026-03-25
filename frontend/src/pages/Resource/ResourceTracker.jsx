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
                // Fetch Resources w/ Filters
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
                toast.success('Marked as completed!');
            } else {
                setCompletedIds(prev => prev.filter(id => id !== resourceId));
                toast('Marked as pending', { icon: '🔄' });
            }

            // Refresh summary
            const progResponse = await api.get('/progress/summary');
            setSummary(progResponse.data.stats);

        } catch (error) {
            toast.error('Error updating progress');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading resources...</div>;

    const totalResources = resources.length;
    const completionPercentage = totalResources === 0 ? 0 : Math.round((completedIds.length / totalResources) * 100);

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Resource Tracker</h1>
            
            {/* Progress Summary Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-slate-700 mb-4">Your Progress</h2>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
                        <div 
                            className="bg-primary-500 h-4 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>
                    <span className="font-bold text-slate-600 whitespace-nowrap">{completionPercentage}% Total</span>
                </div>

                <div className="flex flex-wrap gap-6">
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg border border-emerald-100 min-w-[150px]">
                        <p className="text-sm font-semibold opacity-80 uppercase tracking-wider mb-1">Items Completed</p>
                        <p className="text-3xl font-bold">{summary.totalCompleted}</p>
                    </div>
                    
                    {Object.entries(summary.topics).map(([topic, count]) => (
                        <div key={topic} className="bg-slate-50 text-slate-700 px-4 py-3 rounded-lg border border-slate-100 min-w-[150px]">
                            <p className="text-xs font-semibold opacity-80 uppercase tracking-wider mb-1">{topic}</p>
                            <p className="text-2xl font-bold">{count} <span className="text-sm font-normal opacity-70">done</span></p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select 
                    value={topicFilter} 
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500 font-sans"
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
                    className="border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500 font-sans"
                >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            {/* Resources List */}
            {resources.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                    <p className="text-slate-500">No resources found matching those filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((resource) => {
                        const isCompleted = completedIds.includes(resource._id);
                        
                        return (
                            <div key={resource._id} className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col transition-all ${isCompleted ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 hover:shadow-md'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md">
                                        {resource.topic}
                                    </span>
                                    {isCompleted && (
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 flex items-center px-2 py-1 rounded-full">
                                            ✓ Done
                                        </span>
                                    )}
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{resource.title}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{resource.description}</p>
                                
                                <div className="flex gap-2 mb-6">
                                    <span className="text-xs border text-slate-600 border-slate-200 px-2 py-1 rounded capitalize w-fit">{resource.type}</span>
                                    <span className="text-xs border text-slate-600 border-slate-200 px-2 py-1 rounded capitalize w-fit">{resource.difficulty}</span>
                                </div>

                                <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-100">
                                    <a 
                                        href={resource.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary-600 text-sm font-medium hover:underline"
                                    >
                                        View Resource ↗
                                    </a>
                                    
                                    <button 
                                        onClick={() => handleToggleProgress(resource._id)}
                                        className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${isCompleted ? 'bg-slate-100 text-slate-600 hover:bg-slate-200/80' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}
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
