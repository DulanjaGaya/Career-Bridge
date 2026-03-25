import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ExternalLink, PlayCircle, BookOpen, RefreshCw, Layers, LayoutGrid } from 'lucide-react';

const SkeletonItem = () => (
    <div className="bg-brand-surface rounded-xl border border-brand-border p-4 flex flex-col animate-pulse mb-4">
        <div className="flex justify-between items-start mb-2">
            <div className="h-5 w-16 bg-brand-border rounded-md"></div>
            <div className="h-5 w-16 bg-brand-bg rounded-full"></div>
        </div>
        <div className="h-5 w-3/4 bg-brand-border rounded mb-2"></div>
        <div className="h-4 w-full bg-brand-bg rounded mb-1"></div>
        <div className="h-4 w-2/3 bg-brand-bg rounded"></div>
    </div>
);

const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) {
            const videoId = urlObj.searchParams.get('v');
            if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
        } else if (urlObj.hostname.includes('youtu.be')) {
            const videoId = urlObj.pathname.slice(1);
            if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
        }
        return url;
    } catch {
        return url;
    }
};

const ResourceTracker = () => {
    const [resources, setResources] = useState([]);
    const [summary, setSummary] = useState({ totalCompleted: 0, topics: {} });
    const [completedIds, setCompletedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResource, setSelectedResource] = useState(null);
    
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
                
                // Auto-select first resource if none selected or if current selection is no longer in filtered list
                if (resResponse.data.length > 0) {
                    if (!selectedResource || !resResponse.data.find(r => r._id === selectedResource._id)) {
                        setSelectedResource(resResponse.data[0]);
                    }
                } else {
                    setSelectedResource(null);
                }
            } catch (error) {
                toast.error('Failed to load resources');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicFilter, difficultyFilter]); // Removed selectedResource from dependencies to avoid infinite loops

    const handleToggleProgress = async (resourceId) => {
        try {
            const { data } = await api.post('/progress/toggle', { resourceId });
            
            if (data.status === 'completed') {
                setCompletedIds(prev => [...prev, resourceId]);
                toast.success('Marked as completed!', { 
                    icon: <CheckCircle className="text-emerald-500" />,
                    style: { background: '#1E293B', color: '#10B981' } 
                });
            } else {
                setCompletedIds(prev => prev.filter(id => id !== resourceId));
                toast('Marked as pending', { 
                    icon: <RefreshCw size={18} className="text-brand-muted" />, 
                    style: { background: '#1E293B', color: '#F8FAFC' } 
                });
            }

            const progResponse = await api.get('/progress/summary');
            setSummary(progResponse.data.stats);

        } catch (error) {
            toast.error('Error updating progress');
        }
    };

    const completionPercentage = resources.length === 0 ? 0 : Math.round((completedIds.length / resources.length) * 100);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:max-w-[1400px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-text mb-1 tracking-tight">Resource Tracker</h1>
                    <p className="text-brand-muted">Master your interview skills through curated materials.</p>
                </div>
                
                {/* Global Progress Pill */}
                {!loading && (
                    <div className="bg-brand-surface border border-brand-border px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
                        <div className="w-32 h-2 bg-brand-bg rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-brand-primary to-brand-primaryHover"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.round((summary.totalCompleted / Math.max(1, summary.totalCompleted + (resources.length - completedIds.length))) * 100)}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                        <span className="text-sm font-bold text-brand-text">
                            {summary.totalCompleted} <span className="text-brand-muted font-medium">Done</span>
                        </span>
                    </div>
                )}
            </div>

            {/* Main Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
                
                {/* Left Pane: List & Filters */}
                <div className="lg:col-span-4 max-h-full flex flex-col bg-brand-surface rounded-2xl shadow-lg border border-brand-border overflow-hidden">
                    <div className="p-4 border-b border-brand-border/60 bg-brand-bg/30">
                        <div className="flex gap-2">
                            <select 
                                value={topicFilter} 
                                onChange={(e) => setTopicFilter(e.target.value)}
                                className="flex-1 bg-brand-bg border border-brand-border text-brand-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
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
                                className="flex-1 bg-brand-bg border border-brand-border text-brand-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                            >
                                <option value="">All Levels</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
                        ) : resources.length === 0 ? (
                            <div className="h-full flex flex-col justify-center items-center text-center p-6">
                                <Layers size={40} className="text-brand-border mb-3" />
                                <p className="text-brand-muted font-medium">No resources match your filters.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {resources.map((resource) => {
                                    const isCompleted = completedIds.includes(resource._id);
                                    const isSelected = selectedResource?._id === resource._id;
                                    
                                    return (
                                        <motion.div 
                                            whileHover={{ scale: 0.98 }}
                                            key={resource._id} 
                                            onClick={() => setSelectedResource(resource)}
                                            className={`cursor-pointer rounded-xl p-4 flex flex-col transition-all border ${isSelected ? 'bg-brand-primary/5 border-brand-primary shadow-sm' : 'bg-brand-bg border-brand-border hover:border-brand-primary/40'} ${isCompleted && !isSelected ? 'opacity-70' : ''}`}
                                        >
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <h3 className={`font-bold text-sm leading-tight line-clamp-2 ${isSelected ? 'text-brand-primary' : 'text-brand-text'}`}>
                                                    {resource.title}
                                                </h3>
                                                {isCompleted && <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />}
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-auto">
                                                <span className="text-[10px] font-bold bg-brand-surface border border-brand-border px-2 py-0.5 rounded text-brand-muted tracking-wider uppercase">
                                                    {resource.topic}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] text-brand-muted uppercase font-semibold">
                                                    {resource.type === 'video' ? <PlayCircle size={12}/> : <BookOpen size={12}/>}
                                                    {resource.type}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane: Media Preview */}
                <div className="lg:col-span-8 max-h-full flex flex-col bg-brand-surface rounded-2xl shadow-lg border border-brand-border overflow-hidden relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-brand-bg border-t-brand-primary rounded-full animate-spin"></div>
                        </div>
                    ) : !selectedResource ? (
                        <div className="flex-1 flex flex-col justify-center items-center p-12 text-center bg-brand-bg/20">
                            <div className="w-20 h-20 bg-brand-bg rounded-2xl flex justify-center items-center border border-brand-border shadow-inner mb-6">
                                <LayoutGrid size={32} className="text-brand-muted" />
                            </div>
                            <h2 className="text-2xl font-bold text-brand-text mb-2">Select a Resource</h2>
                            <p className="text-brand-muted max-w-sm">Choose an item from the list to preview its content and track your progress.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={selectedResource._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1 flex flex-col h-full"
                            >
                                {/* Media Player Area */}
                                <div className="w-full bg-black relative flex-shrink-0" style={{ height: '60%' }}>
                                    {getEmbedUrl(selectedResource.url) !== selectedResource.url ? (
                                        <iframe 
                                            src={getEmbedUrl(selectedResource.url)}
                                            className="w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title={selectedResource.title}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-bg to-brand-surface p-8 text-center border-b border-brand-border">
                                            <ExternalLink size={48} className="text-brand-muted mb-4 opacity-50" />
                                            <p className="text-brand-muted mb-6">This resource cannot be deeply embedded.</p>
                                            <a 
                                                href={selectedResource.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="bg-brand-primary hover:bg-brand-primaryHover text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] flex items-center gap-2"
                                            >
                                                Open Resource in New Tab <ExternalLink size={18} />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Details Area */}
                                <div className="flex-1 p-6 overflow-y-auto flex flex-col bg-brand-surface">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-md tracking-widest uppercase">
                                                    {selectedResource.topic}
                                                </span>
                                                <span className="text-xs font-bold bg-brand-bg text-brand-muted border border-brand-border px-3 py-1 rounded-md tracking-widest uppercase">
                                                    {selectedResource.difficulty}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-brand-text leading-tight max-w-2xl">
                                                {selectedResource.title}
                                            </h2>
                                        </div>
                                        
                                        <div className="shrink-0 flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                                            <button 
                                                onClick={() => handleToggleProgress(selectedResource._id)}
                                                className={`flex-1 md:flex-none flex justify-center items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-sm border ${
                                                    completedIds.includes(selectedResource._id) 
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' 
                                                    : 'bg-brand-bg text-brand-text border-brand-border hover:border-brand-primary hover:text-brand-primary'
                                                }`}
                                            >
                                                {completedIds.includes(selectedResource._id) ? (
                                                    <><CheckCircle size={18} /> Completed</>
                                                ) : (
                                                    <><CheckCircle size={18} className="opacity-50" /> Mark as Done</>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-full h-[1px] bg-brand-border/60 my-5"></div>
                                    
                                    <div className="prose prose-invert max-w-none text-brand-muted">
                                        <p className="leading-relaxed whitespace-pre-line text-[15px]">
                                            {selectedResource.description || "No detailed description available for this resource."}
                                        </p>
                                    </div>
                                    
                                    {getEmbedUrl(selectedResource.url) !== selectedResource.url && (
                                        <div className="mt-auto pt-8">
                                            <a 
                                                href={selectedResource.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text transition-colors"
                                            >
                                                <ExternalLink size={16} /> Open original link in new window
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResourceTracker;
