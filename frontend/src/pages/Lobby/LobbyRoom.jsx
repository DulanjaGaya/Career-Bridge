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
                
                // If status changed or navigated
                if (lobbyData.status === 'closed') {
                    toast('This lobby has been closed.', { icon: 'ℹ️' });
                    navigate('/lobbies');
                    return;
                }
                
                setLobby(lobbyData);

                // Fetch Questions for topic ONCE if empty
                if (questions.length === 0) {
                    const { data: qData } = await api.get(`/questions?topic=${lobbyData.topic}`);
                    setQuestions(qData);
                    if (qData.length > 0) {
                        setCurrentQuestion(qData[lobbyData.currentQuestionIndex]);
                        setTimeLeft(qData[lobbyData.currentQuestionIndex]?.timeLimit || 30);
                    }
                } else if (lobbyData.currentQuestionIndex !== lobby?.currentQuestionIndex) {
                    // Host moved to next question!
                    setCurrentQuestion(questions[lobbyData.currentQuestionIndex]);
                    setTimeLeft(questions[lobbyData.currentQuestionIndex]?.timeLimit || 30);
                    setShowResults(false);
                    setHasSubmitted(false);
                    setSelectedOption('');
                    setResults([]);
                }
            } catch (error) {
                toast.error('Failed to sync lobby data');
            }
        };

        fetchLobbyParams();

        const pollInterval = setInterval(() => {
            fetchLobbyParams();
        }, 5000); // Simple 5-second polling for updates

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
        // Fetch results and scoreboard
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
            toast.success('Answer recorded!');
        } catch (error) {
            toast.error('Failed to submit answer');
            setHasSubmitted(false);
            setSelectedOption('');
        }
    };

    const handleNextQuestion = async () => {
        if (!lobby || lobby.host._id !== user._id) return;
        if (lobby.currentQuestionIndex + 1 >= questions.length) {
            toast('No more questions in this topic!', { icon: '👏' });
            return;
        }
        try {
            await api.patch(`/lobbies/${id}/next-question`);
            setShowResults(false);
            setHasSubmitted(false);
            setSelectedOption('');
            // local state update forced via polling or explicit fetch (polling will catch it)
        } catch (err) {
            toast.error('Failed to move to next question');
        }
    };

    const handleCloseLobby = async () => {
        if (!lobby || lobby.host._id !== user._id) return;
        try {
            await api.patch(`/lobbies/${id}/close`);
            toast.success('Lobby closed');
            navigate('/lobbies');
        } catch (err) {
            toast.error('Failed to close lobby');
        }
    };

    if (!lobby || !currentQuestion) {
        return <div className="p-12 text-center text-slate-500">Loading Interview Room...</div>;
    }

    const isHost = lobby.host._id === user._id;

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-6xl">
            {/* Top Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        {lobby.title}
                        <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-1 rounded-md uppercase tracking-wider">
                            {lobby.topic}
                        </span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Host: {lobby.host.name} • Participants: {lobby.members.length}/{lobby.maxMembers}</p>
                </div>
                
                {isHost && (
                    <div className="flex gap-3">
                        {showResults && lobby.currentQuestionIndex + 1 < questions.length && (
                            <button 
                                onClick={handleNextQuestion}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
                            >
                                Next Question
                            </button>
                        )}
                        <button 
                            onClick={handleCloseLobby}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors border border-red-200"
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
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[400px]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                            <span className="font-semibold text-slate-600">Question {lobby.currentQuestionIndex + 1} of {questions.length}</span>
                            <div className={`font-mono text-xl font-bold px-3 py-1 rounded-md ${timeLeft <= 10 && !showResults ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 text-slate-700'}`}>
                                ⏳ {timeLeft}s
                            </div>
                        </div>
                        
                        <div className="p-8 flex-grow flex flex-col justify-center">
                            <h2 className="text-3xl font-medium text-slate-800 text-center mb-10 leading-relaxed">
                                {currentQuestion.text}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((opt, idx) => {
                                    // Determine button styles
                                    let btnStyle = "bg-white border text-slate-700 border-slate-300 hover:border-primary-500 hover:bg-primary-50";
                                    
                                    if (hasSubmitted && selectedOption === opt) {
                                        btnStyle = "bg-primary-100 border-primary-500 text-primary-800 font-semibold ring-2 ring-primary-500 ring-offset-1";
                                    }

                                    // During results, highlight correct answers visually if we had access to correctAnswer (it was stripped by the API)
                                    // Normally we would just see people's votes. Since we stripped it, we can look at our own 'results' array
                                    // Actually, we don't have the explicit Correct string here unless we fetch it. 
                                    // Wait, scoreboard indicates points, but not the exact text. For a simple MVP, the host explains it, or we rely on the DB.
                                    // Let's just highlight what the user picked.
                                    
                                    return (
                                        <button
                                            key={idx}
                                            disabled={hasSubmitted || showResults}
                                            onClick={() => submitAnswer(opt)}
                                            className={`p-4 rounded-xl text-lg transition-all duration-200 shadow-sm ${btnStyle} disabled:cursor-default`}
                                        >
                                            {String.fromCharCode(65 + idx)}. {opt}
                                        </button>
                                    );
                                })}
                            </div>

                            {showResults && (
                                <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-center font-medium">
                                    Time is up! Answers are locked in. Check the scoreboard!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Scoreboard */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-primary-600 text-white p-4">
                            <h3 className="font-bold flex items-center gap-2">🏆 Live Scoreboard</h3>
                        </div>
                        <div className="p-0">
                            {scoreboard.length === 0 ? (
                                <p className="p-4 text-center text-slate-500 italic text-sm">Waiting for first answers...</p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {scoreboard.map((entry, idx) => (
                                        <li key={idx} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 text-center font-bold text-slate-400">{idx + 1}</span>
                                                <span className="font-medium text-slate-700">{entry.name}</span>
                                            </div>
                                            <span className="font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{entry.score} pts</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="border-b border-slate-100 p-4">
                            <h3 className="font-bold text-slate-800">Room Participants</h3>
                        </div>
                        <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                            {lobby.members.map((m) => (
                                <li key={m._id} className="p-3 flex items-center gap-3 text-sm text-slate-600">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-primary-100 flex items-center justify-center text-primary-700 font-bold shadow-inner">
                                        {m.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="flex-grow">{m.name} {m._id === user._id ? '(You)' : ''}</span>
                                    {m._id === lobby.host._id && (
                                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase font-bold tracking-wide">Host</span>
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
