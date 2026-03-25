import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const LobbyRoom = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [lobby, setLobby] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [results, setResults] = useState([]);
    const [scoreboard, setScoreboard] = useState([]);
    const [showResults, setShowResults] = useState(false);

    // Initial Fetch & Polling
    useEffect(() => {
        let isMounted = true;
        const fetchLobbyParams = async () => {
            try {
                const { data: lobbyData } = await api.get(`/lobbies/${id}`);
                if (!isMounted) return;
                
                if (lobbyData.status === 'closed') {
                    toast('This lobby has been closed.', { icon: 'ℹ️', style: { background: '#1E293B', color: '#F8FAFC' } });
                    navigate('/lobbies');
                    return;
                }
                
                setLobby(lobbyData);

                if (questions.length === 0) {
                    const { data: qData } = await api.get(`/questions?topic=${lobbyData.topic}`);
                    setQuestions(qData);
                    if (qData.length > 0) {
                        setCurrentQuestion(qData[lobbyData.currentQuestionIndex]);
                        setTimeLeft(qData[lobbyData.currentQuestionIndex]?.timeLimit || 30);
                    }
                } else if (lobbyData.currentQuestionIndex !== lobby?.currentQuestionIndex) {
                    setCurrentQuestion(questions[lobbyData.currentQuestionIndex]);
                    setTimeLeft(questions[lobbyData.currentQuestionIndex]?.timeLimit || 30);
                    setShowResults(false);
                    setHasSubmitted(false);
                    setSelectedOption('');
                    setResults([]);
                }
            } catch (error) {
                toast.error('Failed to sync lobby data', { style: { background: '#1E293B', color: '#F8FAFC' } });
            }
        };

        fetchLobbyParams();

        const pollInterval = setInterval(() => {
            fetchLobbyParams();
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, [id, navigate, lobby?.currentQuestionIndex, questions]);

    // Timer countdown
    useEffect(() => {
        if (!currentQuestion || showResults || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestion, showResults, timeLeft]);

    const handleTimeUp = async () => {
        setShowResults(true);
        try {
            const { data: resData } = await api.get(`/answers/results/${id}/${currentQuestion._id}`);
            const { data: scoreData } = await api.get(`/answers/scoreboard/${id}`);
            setResults(resData);
            setScoreboard(scoreData);
        } catch (error) {
            console.error('Failed to fetch results');
        }
    };

    const submitAnswer = async (option) => {
        if (hasSubmitted || showResults) return;
        setSelectedOption(option);
        setHasSubmitted(true);
        try {
            await api.post('/answers', {
                lobbyId: id,
                questionId: currentQuestion._id,
                selectedOption: option
            });
            toast.success('Answer recorded!', { style: { background: '#1E293B', color: '#F97316' } });
        } catch (error) {
            setHasSubmitted(false);
            setSelectedOption('');
        }
    };

    const handleNextQuestion = async () => {
        if (!lobby || lobby.host._id !== user._id) return;
        if (lobby.currentQuestionIndex + 1 >= questions.length) {
            toast('No more questions in this topic!', { icon: '👏', style: { background: '#1E293B', color: '#F8FAFC' } });
            return;
        }
        try {
            await api.patch(`/lobbies/${id}/next-question`);
            setShowResults(false);
            setHasSubmitted(false);
            setSelectedOption('');
        } catch (err) {
            toast.error('Failed to move to next question', { style: { background: '#1E293B', color: '#F8FAFC' } });
        }
    };

    const handleCloseLobby = async () => {
        if (!lobby || lobby.host._id !== user._id) return;
        try {
            await api.patch(`/lobbies/${id}/close`);
            navigate('/lobbies');
        } catch (err) {
            console.error('Failed to close lobby');
        }
    };

    if (!lobby || !currentQuestion) {
        return <div className="p-12 text-center text-brand-muted">Loading Interview Room...</div>;
    }

    const isHost = lobby.host._id === user._id;

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-6xl">
            {/* Top Bar */}
            <div className="bg-brand-surface rounded-xl shadow border border-brand-border p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-text flex items-center gap-3">
                        {lobby.title}
                        <span className="text-xs bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-semibold px-2 py-1 rounded-md uppercase tracking-wider">
                            {lobby.topic}
                        </span>
                    </h1>
                    <p className="text-sm text-brand-muted mt-1">Host: <span className="text-brand-text">{lobby.host.name}</span> • Participants: <span className="text-brand-text">{lobby.members.length}/{lobby.maxMembers}</span></p>
                </div>
                
                {isHost && (
                    <div className="flex gap-3">
                        {showResults && lobby.currentQuestionIndex + 1 < questions.length && (
                            <button 
                                onClick={handleNextQuestion}
                                className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors border border-blue-600"
                            >
                                Next Question
                            </button>
                        )}
                        <button 
                            onClick={handleCloseLobby}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg font-medium transition-colors border border-red-500/20"
                        >
                            Close Room
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Interaction Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Question Card */}
                    <div className="bg-brand-surface rounded-xl shadow-lg border border-brand-border flex flex-col min-h-[400px]">
                        <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-bg/50 rounded-t-xl">
                            <span className="font-semibold text-brand-primary uppercase tracking-wider text-sm">Question {lobby.currentQuestionIndex + 1} of {questions.length}</span>
                            <div className={`font-mono text-xl font-bold px-3 py-1 rounded-md border ${timeLeft <= 10 && !showResults ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-brand-bg text-brand-text border-brand-border'}`}>
                                ⏳ {timeLeft}s
                            </div>
                        </div>
                        
                        <div className="p-8 flex-grow flex flex-col justify-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-brand-text text-center mb-10 leading-relaxed">
                                {currentQuestion.text}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((opt, idx) => {
                                    let btnStyle = "bg-brand-bg border border-brand-border text-brand-text hover:border-brand-primary/50 hover:bg-brand-primary/5";
                                    
                                    if (hasSubmitted && selectedOption === opt) {
                                        btnStyle = "bg-brand-primary/10 border-brand-primary text-brand-primary font-bold shadow-[0_0_15px_rgba(249,115,22,0.15)]";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={hasSubmitted || showResults}
                                            onClick={() => submitAnswer(opt)}
                                            className={`p-4 rounded-xl text-lg transition-all duration-200 shadow-sm ${btnStyle} disabled:cursor-default text-left`}
                                        >
                                            <span className="text-brand-muted mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                                        </button>
                                    );
                                })}
                            </div>

                            {showResults && (
                                <div className="mt-8 p-4 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-brand-text text-center font-medium shadow-inner shadow-brand-primary/5">
                                    Time is up! Answers are locked in. Check the scoreboard!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Scoreboard */}
                    <div className="bg-brand-surface rounded-xl shadow-lg border border-brand-border overflow-hidden">
                        <div className="bg-gradient-to-r from-brand-primary to-brand-primaryHover text-white border-b border-brand-border p-4">
                            <h3 className="font-bold flex items-center gap-2">🏆 Live Scoreboard</h3>
                        </div>
                        <div className="p-0">
                            {scoreboard.length === 0 ? (
                                <p className="p-4 text-center text-brand-muted italic text-sm">Waiting for first answers...</p>
                            ) : (
                                <ul className="divide-y divide-brand-border/50">
                                    {scoreboard.map((entry, idx) => (
                                        <li key={idx} className="flex justify-between items-center p-4 hover:bg-brand-bg/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 text-center font-bold text-brand-muted">{idx + 1}</span>
                                                <span className="font-medium text-brand-text">{entry.name}</span>
                                            </div>
                                            <span className="font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-full text-sm">
                                                {entry.score} pts
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="bg-brand-surface rounded-xl shadow-lg border border-brand-border">
                        <div className="border-b border-brand-border p-4 bg-brand-bg/50 rounded-t-xl">
                            <h3 className="font-bold text-brand-text uppercase tracking-wider text-xs">Room Participants</h3>
                        </div>
                        <ul className="divide-y divide-brand-border max-h-64 overflow-y-auto">
                            {lobby.members.map((m) => (
                                <li key={m._id} className="p-3 flex items-center gap-3 text-sm text-brand-text">
                                    <div className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-brand-primary font-bold shadow-inner">
                                        {m.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="flex-grow">{m.name} {m._id === user._id ? <span className="text-brand-muted font-normal">(You)</span> : ''}</span>
                                    {m._id === lobby.host._id && (
                                        <span className="text-[10px] bg-brand-blue/10 border border-brand-blue/20 text-brand-blue px-2 py-0.5 rounded uppercase font-bold tracking-wide">Host</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LobbyRoom;
