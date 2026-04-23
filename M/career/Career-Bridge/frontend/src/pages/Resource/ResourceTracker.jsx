import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ExternalLink, PlayCircle, BookOpen, RefreshCw, Layers, LayoutGrid, Download, Upload, Star, MessageSquare, Calendar } from 'lucide-react';

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
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filters
    const [topicFilter, setTopicFilter] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');

    // Timeline and Feedback state
    const [showTimeline, setShowTimeline] = useState(false);
    const [timeline, setTimeline] = useState([]);
    const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
    const [showFeedback, setShowFeedback] = useState(false);
    const [resourceRating, setResourceRating] = useState(null);
    const [showPdfUpload, setShowPdfUpload] = useState(false);
    const [pdfForm, setPdfForm] = useState({ title: '', topic: '', url: '', description: '', difficulty: 'Medium' });

    useEffect(() => {
        fetchData();
    }, [topicFilter, difficultyFilter]);

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

    // Download PDF report
    const handleDownloadReport = async () => {
        try {
            const response = await api.get('/resources/report/download', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'completion-report.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Report downloaded as PDF!');
        } catch (error) {
            toast.error('Failed to download PDF report');
        }
    };

    const handleFetchTimeline = async () => {
        try {
            const response = await api.get('/resources/timeline');
            setTimeline(response.data);
            setShowTimeline(true);
        } catch (error) {
            toast.error('Failed to fetch timeline');
        }
    };

    const handleAddFeedback = async () => {
        try {
            if (!feedback.rating) {
                toast.error('Please select a rating');
                return;
            }

            await api.post('/feedback', {
                resourceId: selectedResource._id,
                rating: feedback.rating,
                comment: feedback.comment
            });

            toast.success('Feedback submitted!');
            setFeedback({ rating: 0, comment: '' });
            setShowFeedback(false);
            fetchResourceRating();
        } catch (error) {
            toast.error('Failed to submit feedback');
        }
    };

    const fetchResourceRating = async () => {
        try {
            const response = await api.get(`/feedback/resource/${selectedResource._id}`);
            setResourceRating(response.data);
        } catch (error) {
            setResourceRating(null);
        }
    };

    const handleAddPdfResource = async () => {
        try {
            if (!pdfForm.title || !pdfForm.topic || !pdfForm.url) {
                toast.error('Please fill in all required fields');
                return;
            }

            await api.post('/resources/add-pdf', pdfForm);
            toast.success('PDF resource added successfully!');
            setPdfForm({ title: '', topic: '', url: '', description: '', difficulty: 'Medium' });
            setShowPdfUpload(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to add PDF resource');
        }
    };

    const filteredResources = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (selectedResource) {
            fetchResourceRating();
        }
    }, [selectedResource?._id]);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:max-w-[1400px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-text mb-1 tracking-tight">Resource Tracker</h1>
                    <p className="text-brand-muted">Master your interview skills through curated materials.</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={handleFetchTimeline}
                        className="flex items-center gap-2 bg-brand-surface hover:bg-brand-bg text-brand-text font-bold py-2 px-4 rounded-xl transition-all border border-brand-border"
                    >
                        <Calendar size={18} /> Timeline
                    </button>
                    <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 bg-brand-surface hover:bg-brand-bg text-brand-text font-bold py-2 px-4 rounded-xl transition-all border border-brand-border"
                    >
                        <Download size={18} /> Report (PDF)
                    </button>
                    <button
                        onClick={() => setShowPdfUpload(!showPdfUpload)}
                        className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold py-2 px-4 rounded-xl transition-all shadow-sm"
                    >
                        <Upload size={18} /> Add PDF
                    </button>
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

            {/* PDF Upload Form */}
            {showPdfUpload && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6 shadow-lg"
                >
                    <h3 className="text-xl font-bold text-brand-text mb-4">Add PDF Resource</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Resource Title *"
                            value={pdfForm.title}
                            onChange={e => setPdfForm({...pdfForm, title: e.target.value})}
                            className="bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2 outline-none focus:border-brand-primary"
                        />
                        <select
                            value={pdfForm.topic}
                            onChange={e => setPdfForm({...pdfForm, topic: e.target.value})}
                            className="bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2 outline-none focus:border-brand-primary"
                        >
                            <option value="">Select Topic *</option>
                            <option value="DSA">DSA</option>
                            <option value="OOP">OOP</option>
                            <option value="System Design">System Design</option>
                            <option value="DBMS">DBMS</option>
                            <option value="Web Dev">Web Dev</option>
                        </select>
                        <input
                            type="url"
                            placeholder="Drive/PDF Link *"
                            value={pdfForm.url}
                            onChange={e => setPdfForm({...pdfForm, url: e.target.value})}
                            className="bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2 outline-none focus:border-brand-primary md:col-span-2"
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={pdfForm.description}
                            onChange={e => setPdfForm({...pdfForm, description: e.target.value})}
                            className="bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2 outline-none focus:border-brand-primary md:col-span-2"
                        />
                        <select
                            value={pdfForm.difficulty}
                            onChange={e => setPdfForm({...pdfForm, difficulty: e.target.value})}
                            className="bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2 outline-none focus:border-brand-primary"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                        <div className="flex gap-3 md:col-span-2">
                            <button
                                onClick={handleAddPdfResource}
                                className="flex-1 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold py-2 rounded-lg transition-all"
                            >
                                Add Resource
                            </button>
                            <button
                                onClick={() => setShowPdfUpload(false)}
                                className="flex-1 bg-brand-bg border border-brand-border text-brand-text font-bold py-2 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Timeline Modal */}
            {showTimeline && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowTimeline(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-brand-surface rounded-2xl border border-brand-border p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold text-brand-text mb-6">Completion Timeline</h3>
                        <div className="space-y-4">
                            {timeline.length > 0 ? (
                                timeline.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 border-l-2 border-brand-primary pl-4 py-2">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-3 h-3 bg-brand-primary rounded-full -translate-x-[7px]"></div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-brand-text">{item.resourceTitle}</h4>
                                            <p className="text-sm text-brand-muted">{item.resourceTopic}</p>
                                            <p className="text-xs text-brand-muted/70 mt-1">
                                                {new Date(item.completedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-brand-muted text-center py-8">No completions yet</p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowTimeline(false)}
                            className="w-full mt-6 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold py-2 rounded-lg transition-all"
                        >
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            )}

            {/* Main Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
                
                {/* Left Pane: List & Filters */}
                <div className="lg:col-span-4 max-h-full flex flex-col bg-brand-surface rounded-2xl shadow-lg border border-brand-border overflow-hidden">
                    <div className="p-4 border-b border-brand-border/60 bg-brand-bg/30">
                        <div className="flex gap-2 mb-2">
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
                                <option value="Web Dev">Web Dev</option>
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
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search by title..."
                            className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                        />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
                        ) : filteredResources.length === 0 ? (
                            <div className="h-full flex flex-col justify-center items-center text-center p-6">
                                <Layers size={40} className="text-brand-border mb-3" />
                                <p className="text-brand-muted font-medium">No resources match your filters.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredResources.map((resource) => {
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
                                <div className="w-full bg-black relative flex-shrink-0" style={{ height: '50%' }}>
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
                                        
                                        <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                                            <button 
                                                onClick={() => handleToggleProgress(selectedResource._id)}
                                                className={`flex justify-center items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-sm border ${
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
                                            <button
                                                onClick={() => setShowFeedback(!showFeedback)}
                                                className="flex justify-center items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-sm border bg-brand-bg text-brand-text border-brand-border hover:border-brand-primary"
                                            >
                                                <MessageSquare size={18} /> Feedback
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rating Display */}
                                    {resourceRating && resourceRating.averageRating > 0 && (
                                        <div className="flex items-center gap-2 mb-4 p-3 bg-brand-bg/30 rounded-lg">
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={i < Math.round(resourceRating.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-brand-border'}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-brand-text font-semibold">{resourceRating.averageRating}/5</span>
                                            <span className="text-xs text-brand-muted">({resourceRating.totalReviews} reviews)</span>
                                        </div>
                                    )}

                                    {/* Feedback Modal Popup */}
                                    {showFeedback && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                                            onClick={() => setShowFeedback(false)}
                                        >
                                            <motion.div
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0.95 }}
                                                className="bg-brand-bg border border-brand-border rounded-2xl p-6 w-full max-w-md shadow-xl relative"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <h3 className="text-xl font-bold text-brand-text mb-4">Leave Feedback</h3>
                                                <div className="mb-3">
                                                    <p className="text-sm font-semibold text-brand-text mb-2">Rate this resource:</p>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map(num => (
                                                            <button
                                                                key={num}
                                                                onClick={() => setFeedback({...feedback, rating: num})}
                                                                className={`transition-colors ${feedback.rating >= num ? 'text-yellow-400' : 'text-brand-border'}`}
                                                            >
                                                                <Star size={24} fill={feedback.rating >= num ? 'currentColor' : 'none'} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <textarea
                                                    placeholder="Share your thoughts... (optional)"
                                                    value={feedback.comment}
                                                    onChange={e => setFeedback({...feedback, comment: e.target.value})}
                                                    className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-primary mb-3 resize-none"
                                                    rows="3"
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={handleAddFeedback}
                                                        className="flex-1 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold py-2 rounded-lg transition-all"
                                                    >
                                                        Submit
                                                    </button>
                                                    <button
                                                        onClick={() => setShowFeedback(false)}
                                                        className="flex-1 bg-brand-bg border border-brand-border text-brand-text font-bold py-2 rounded-lg transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}

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
