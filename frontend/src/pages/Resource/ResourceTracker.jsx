import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ExternalLink, PlayCircle, BookOpen, RefreshCw, Layers, LayoutGrid, Download, Plus, Star, MessageSquare, Calendar, AlertCircle } from 'lucide-react';

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
    const [showAddResource, setShowAddResource] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingResourceId, setEditingResourceId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetResource, setDeleteTargetResource] = useState(null);
    const [resourceForm, setResourceForm] = useState({ title: '', topic: '', type: 'video', url: '', description: '', difficulty: 'Medium' });
    const [formErrors, setFormErrors] = useState({});

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

    // Frontend validation
    const validateResourceForm = () => {
        const errors = {};
        
        if (!resourceForm.title.trim()) {
            errors.title = 'Title is required';
        } else if (resourceForm.title.trim().length < 3) {
            errors.title = 'Title must be at least 3 characters';
        } else if (resourceForm.title.trim().length > 200) {
            errors.title = 'Title must be under 200 characters';
        }

        if (!resourceForm.topic) {
            errors.topic = 'Topic is required';
        }

        if (!resourceForm.url.trim()) {
            errors.url = 'URL is required';
        } else {
            try {
                const urlObj = new URL(resourceForm.url);
                if (!['http:', 'https:'].includes(urlObj.protocol)) {
                    errors.url = 'URL must start with http:// or https://';
                }
                // YouTube URL validation for video type
                if (resourceForm.type === 'video') {
                    const hostname = urlObj.hostname.toLowerCase();
                    const isYouTube = hostname.includes('youtube.com') || hostname.includes('youtu.be');
                    if (!isYouTube) {
                        errors.url = 'Video resources must use a YouTube URL';
                    }
                }
            } catch {
                errors.url = 'Please enter a valid URL';
            }
        }

        if (resourceForm.description && resourceForm.description.length > 1000) {
            errors.description = 'Description must be under 1000 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddResource = async () => {
        if (!validateResourceForm()) return;

        try {
            await api.post('/resources/add', resourceForm);
            const typeLabel = resourceForm.type.charAt(0).toUpperCase() + resourceForm.type.slice(1);
            toast.success(`${typeLabel} resource added successfully!`);
            setResourceForm({ title: '', topic: '', type: 'video', url: '', description: '', difficulty: 'Medium' });
            setFormErrors({});
            setShowAddResource(false);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to add resource';
            toast.error(msg);
        }
    };

    const resetForm = () => {
        setResourceForm({ title: '', topic: '', type: 'video', url: '', description: '', difficulty: 'Medium' });
        setFormErrors({});
        setIsEditing(false);
        setEditingResourceId(null);
    };

    const handleEditResource = (resource) => {
        setResourceForm({
            title: resource.title || '',
            topic: resource.topic || '',
            type: resource.type || 'video',
            url: resource.url || '',
            description: resource.description || '',
            difficulty: resource.difficulty || 'Medium',
        });
        setShowAddResource(true);
        setIsEditing(true);
        setEditingResourceId(resource._id);
    };

    const handleUpdateResource = async () => {
        if (!validateResourceForm() || !editingResourceId) return;

        try {
            await api.put(`/resources/${editingResourceId}`, resourceForm);
            toast.success('Resource updated successfully!');
            fetchData();
            resetForm();
            setShowAddResource(false);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update resource';
            toast.error(msg);
        }
    };

    const openDeleteConfirmation = (resource) => {
        setDeleteTargetResource(resource);
        setShowDeleteConfirm(true);
    };

    const cancelDelete = () => {
        setDeleteTargetResource(null);
        setShowDeleteConfirm(false);
    };

    const handleDeleteResource = async () => {
        if (!deleteTargetResource) return;

        try {
            await api.delete(`/resources/${deleteTargetResource._id}`);
            toast.success('Resource deleted successfully!');
            fetchData();
            if (selectedResource && selectedResource._id === deleteTargetResource._id) {
                setSelectedResource(null);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete resource';
            toast.error(msg);
        } finally {
            cancelDelete();
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
                        onClick={() => setShowAddResource(!showAddResource)}
                        className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold py-2 px-4 rounded-xl transition-all shadow-sm"
                    >
                        <Plus size={18} /> Add Resource
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

            {/* Add Resource Form */}
            {showAddResource && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6 shadow-lg"
                >
                    <h3 className="text-xl font-bold text-brand-text mb-4">
                        {isEditing ? 'Edit Resource' : 'Add New Resource'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="flex flex-col gap-1">
                            <input
                                type="text"
                                placeholder="Resource Title *"
                                value={resourceForm.title}
                                onChange={e => { setResourceForm({...resourceForm, title: e.target.value}); setFormErrors({...formErrors, title: ''}); }}
                                className={`bg-brand-bg border ${formErrors.title ? 'border-red-500' : 'border-brand-border'} text-brand-text rounded-lg px-4 py-2.5 outline-none focus:border-brand-primary transition-colors`}
                            />
                            {formErrors.title && <span className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{formErrors.title}</span>}
                        </div>

                        {/* Type Selector */}
                        <select
                            value={resourceForm.type}
                            onChange={e => { setResourceForm({...resourceForm, type: e.target.value, url: ''}); setFormErrors({...formErrors, url: ''}); }}
                            className="bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2.5 outline-none focus:border-brand-primary transition-colors"
                        >
                            <option value="video">🎬 Video (YouTube)</option>
                            <option value="pdf">📄 PDF / Document</option>
                            <option value="article">📝 Article</option>
                        </select>

                        {/* Topic */}
                        <div className="flex flex-col gap-1">
                            <select
                                value={resourceForm.topic}
                                onChange={e => { setResourceForm({...resourceForm, topic: e.target.value}); setFormErrors({...formErrors, topic: ''}); }}
                                className={`bg-brand-bg border ${formErrors.topic ? 'border-red-500' : 'border-brand-border'} text-brand-text rounded-lg px-4 py-2.5 outline-none focus:border-brand-primary transition-colors`}
                            >
                                <option value="">Select Topic *</option>
                                <option value="DSA">DSA</option>
                                <option value="OOP">OOP</option>
                                <option value="System Design">System Design</option>
                                <option value="DBMS">DBMS</option>
                                <option value="Web Dev">Web Dev</option>
                                <option value="HR">HR</option>
                            </select>
                            {formErrors.topic && <span className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{formErrors.topic}</span>}
                        </div>

                        {/* Difficulty */}
                        <select
                            value={resourceForm.difficulty}
                            onChange={e => setResourceForm({...resourceForm, difficulty: e.target.value})}
                            className="bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2.5 outline-none focus:border-brand-primary transition-colors"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>

                        {/* URL */}
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <input
                                type="url"
                                placeholder={resourceForm.type === 'video' ? 'YouTube URL * (e.g. https://youtu.be/abc123)' : resourceForm.type === 'pdf' ? 'PDF / Drive Link *' : 'Article URL *'}
                                value={resourceForm.url}
                                onChange={e => { setResourceForm({...resourceForm, url: e.target.value}); setFormErrors({...formErrors, url: ''}); }}
                                className={`bg-brand-bg border ${formErrors.url ? 'border-red-500' : 'border-brand-border'} text-brand-text rounded-lg px-4 py-2.5 outline-none focus:border-brand-primary transition-colors`}
                            />
                            {formErrors.url && <span className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{formErrors.url}</span>}
                            {resourceForm.type === 'video' && !formErrors.url && (
                                <span className="text-brand-muted text-xs">Supports youtube.com and youtu.be links</span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <textarea
                                placeholder="Description (optional)"
                                value={resourceForm.description}
                                onChange={e => { setResourceForm({...resourceForm, description: e.target.value}); setFormErrors({...formErrors, description: ''}); }}
                                rows="2"
                                className={`bg-brand-bg border ${formErrors.description ? 'border-red-500' : 'border-brand-border'} text-brand-text rounded-lg px-4 py-2.5 outline-none focus:border-brand-primary transition-colors resize-none`}
                            />
                            <div className="flex justify-between">
                                {formErrors.description && <span className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{formErrors.description}</span>}
                                <span className={`text-xs ml-auto ${resourceForm.description.length > 900 ? 'text-red-400' : 'text-brand-muted'}`}>{resourceForm.description.length}/1000</span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 md:col-span-2">
                            <button
                                onClick={isEditing ? handleUpdateResource : handleAddResource}
                                className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold py-2.5 rounded-lg transition-all"
                            >
                                <Plus size={18} /> {isEditing ? 'Save Changes' : `Add ${resourceForm.type === 'video' ? 'Video' : resourceForm.type === 'pdf' ? 'PDF' : 'Article'}`}
                            </button>
                            <button
                                onClick={() => { setShowAddResource(false); resetForm(); }}
                                className="flex-1 bg-brand-bg border border-brand-border text-brand-text font-bold py-2.5 rounded-lg transition-all hover:border-brand-primary/40"
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

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                    <div className="w-full max-w-md rounded-2xl bg-brand-surface border border-brand-border p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-2">Delete Resource</h3>
                        <p className="text-sm text-brand-muted mb-4">Are you sure you want to delete "{deleteTargetResource?.title}"? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 rounded-lg border border-brand-border text-brand-muted hover:bg-brand-bg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteResource}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
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
                                        
                                        <div className="shrink-0 flex flex-wrap gap-2 w-full md:w-auto">
                                            <button 
                                                onClick={() => handleToggleProgress(selectedResource._id)}
                                                className={`flex justify-center items-center gap-2 font-bold px-4 py-2 rounded-xl transition-all shadow-sm border ${
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
                                            <button
                                                onClick={() => handleEditResource(selectedResource)}
                                                className="flex justify-center items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-sm border bg-brand-surface text-brand-text border-brand-border hover:border-brand-primary"
                                            >
                                                <RefreshCw size={18} /> Edit
                                            </button>
                                            <button
                                                onClick={() => openDeleteConfirmation(selectedResource)}
                                                className="flex justify-center items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-sm border bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20"
                                            >
                                                <AlertCircle size={18} /> Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rating Display */}
                                    {resourceRating && resourceRating.averageRating > 0 && (
                                        <div className="mb-4 p-3 bg-brand-bg/30 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
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
                                            {resourceRating.feedbacks && resourceRating.feedbacks.length > 0 ? (
                                                <div className="space-y-2">
                                                    {resourceRating.feedbacks.map((fb) => (
                                                        <div key={fb._id} className="border border-brand-border/60 rounded-lg p-3 bg-brand-surface">
                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                <strong className="text-xs text-brand-text">{fb.userId?.name || 'Anonymous'}</strong>
                                                                <span className="text-[11px] text-brand-muted">{fb.rating}/5</span>
                                                            </div>
                                                            <p className="text-sm text-brand-muted">{fb.comment || 'No review comment provided.'}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-brand-muted">No written reviews yet.</p>
                                            )}
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
