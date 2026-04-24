import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Trophy, Timer, Info, Users, CheckCircle, ChevronRight, XCircle, Crown } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const RESULT_DISPLAY_MS = 3000;

const getRemainingTime = (startedAt, questionTimeLimit) => {
    if (!questionTimeLimit) {
        return 0;
    }

    const startedAtMs = new Date(startedAt).getTime();
    if (Number.isNaN(startedAtMs)) {
        return questionTimeLimit;
    }

    const elapsedSeconds = Math.floor((Date.now() - startedAtMs) / 1000);
    return Math.max(questionTimeLimit - elapsedSeconds, 0);
};

const LobbyRoom = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { width, height } = useWindowSize();

    const [lobby, setLobby] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [scoreboard, setScoreboard] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [quizEnded, setQuizEnded] = useState(false);
    const [userAttempt, setUserAttempt] = useState({
        attemptNo: 1,
        answeredCount: 0,
        totalQuestions: 0,
        completed: false,
        answeredQuestionIds: [],
        answerMap: {},
        stoppedAtQuestionNumber: 1,
    });

    const activeQuestionRef = useRef({ index: -1, startedAt: '' });
    const handledQuestionRef = useRef('');
    const autoAdvanceTimeoutRef = useRef(null);

    const isHost = lobby?.host?._id === user._id;
    const questionOptions = Array.isArray(currentQuestion?.options)
        ? currentQuestion.options
        : [];
    const questionPrompt = currentQuestion?.prompt || currentQuestion?.title || currentQuestion?.text || 'Question';
    const questionDescription = currentQuestion?.description || '';

    const advanceToNextQuestion = async () => {
        if (!lobby || !isHost || lobby.currentQuestionIndex + 1 >= questions.length) {
            return;
        }

        try {
            const { data } = await api.patch(`/lobbies/${id}/next-question`);

            setLobby((prevLobby) => (
                prevLobby
                    ? {
                        ...prevLobby,
                        currentQuestionIndex: data.currentQuestionIndex,
                        questionStartedAt: data.questionStartedAt,
                    }
                    : prevLobby
            ));
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to move to next question',
                { style: { background: '#1E293B', color: '#F8FAFC' } }
            );
        }
    };

    const handleTimeUp = useCallback(async () => {
        if (!currentQuestion || handledQuestionRef.current === currentQuestion._id) {
            return;
        }

        handledQuestionRef.current = currentQuestion._id;
        setShowResults(true);

        try {
            const { data: scoreData } = await api.get(`/answers/scoreboard/${id}`);
            setScoreboard(scoreData);
        } catch {
            console.error('Failed to fetch scoreboard');
        }

        const isLastQuestion = lobby ? lobby.currentQuestionIndex + 1 >= questions.length : true;
        if (isLastQuestion) {
            setQuizEnded(true);
            return;
        }

        if (isHost) {
            if (autoAdvanceTimeoutRef.current) {
                clearTimeout(autoAdvanceTimeoutRef.current);
            }

            autoAdvanceTimeoutRef.current = setTimeout(() => {
                advanceToNextQuestion();
            }, RESULT_DISPLAY_MS);
        }
    }, [advanceToNextQuestion, currentQuestion, id, isHost, lobby, questions.length]);

    useEffect(() => {
        let isMounted = true;

        const fetchLobbyState = async () => {
            try {
                const { data: lobbyData } = await api.get(`/lobbies/${id}`);
                if (!isMounted) {
                    return;
                }

                if (lobbyData.status === 'closed') {
                    if (autoAdvanceTimeoutRef.current) {
                        clearTimeout(autoAdvanceTimeoutRef.current);
                        autoAdvanceTimeoutRef.current = null;
                    }

                    toast('This lobby has been closed by the host.', {
                        icon: <Info size={18} className="text-blue-400" />,
                        style: { background: '#1E293B', color: '#F8FAFC' },
                    });
                    navigate('/lobbies');
                    return;
                }

                const lobbyQuestions = Array.isArray(lobbyData.questions) ? lobbyData.questions : [];
                const nextQuestion = lobbyQuestions[lobbyData.currentQuestionIndex] || null;
                const attempt = lobbyData.userAttempt || {
                    attemptNo: 1,
                    answeredCount: 0,
                    totalQuestions: lobbyQuestions.length,
                    completed: false,
                    answeredQuestionIds: [],
                    answerMap: {},
                    stoppedAtQuestionNumber: 1,
                };
                const questionChanged =
                    activeQuestionRef.current.index !== lobbyData.currentQuestionIndex ||
                    activeQuestionRef.current.startedAt !== (lobbyData.questionStartedAt || '');

                setLobby(lobbyData);
                setQuestions(lobbyQuestions);
                setUserAttempt(attempt);

                if (questionChanged) {
                    activeQuestionRef.current = {
                        index: lobbyData.currentQuestionIndex,
                        startedAt: lobbyData.questionStartedAt || '',
                    };
                    handledQuestionRef.current = '';
                    setCurrentQuestion(nextQuestion);
                    setShowResults(false);
                    const existingSelection = nextQuestion && !attempt.completed
                        ? (attempt.answerMap?.[nextQuestion._id] || '')
                        : '';
                    setHasSubmitted(Boolean(existingSelection));
                    setSelectedOption(existingSelection);
                    setQuizEnded(false);

                    if (autoAdvanceTimeoutRef.current) {
                        clearTimeout(autoAdvanceTimeoutRef.current);
                        autoAdvanceTimeoutRef.current = null;
                    }
                }

                if (nextQuestion) {
                    setTimeLeft(getRemainingTime(lobbyData.questionStartedAt, lobbyData.questionTimeLimit));
                }
            } catch {
                // Ignore transient polling failures.
            }
        };

        fetchLobbyState();

        const pollInterval = setInterval(() => {
            fetchLobbyState();
        }, 3000);

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
            if (autoAdvanceTimeoutRef.current) {
                clearTimeout(autoAdvanceTimeoutRef.current);
                autoAdvanceTimeoutRef.current = null;
            }
        };
    }, [id, navigate]);

    useEffect(() => {
        if (!currentQuestion || !lobby || showResults || quizEnded) {
            return undefined;
        }

        const syncCountdown = () => {
            const nextTimeLeft = getRemainingTime(lobby.questionStartedAt, lobby.questionTimeLimit);
            setTimeLeft(nextTimeLeft);

            if (nextTimeLeft <= 0) {
                handleTimeUp();
                return false;
            }

            return true;
        };

        if (!syncCountdown()) {
            return undefined;
        }

        const timer = setInterval(() => {
            if (!syncCountdown()) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [
        currentQuestion,
        lobby,
        quizEnded,
        showResults,
        handleTimeUp,
    ]);

    const submitAnswer = async (option) => {
        if (hasSubmitted || showResults || !currentQuestion) {
            return;
        }

        setSelectedOption(option);
        setHasSubmitted(true);

        try {
            await api.post('/answers', {
                lobbyId: id,
                questionId: currentQuestion._id,
                selectedOption: option,
            });

            setUserAttempt((prev) => {
                const answeredSet = new Set(prev.answeredQuestionIds || []);
                answeredSet.add(currentQuestion._id);
                const totalQuestions = prev.totalQuestions || questions.length;
                const answeredCount = answeredSet.size;

                return {
                    ...prev,
                    answeredCount,
                    completed: totalQuestions > 0 && answeredCount >= totalQuestions,
                    answeredQuestionIds: Array.from(answeredSet),
                    answerMap: {
                        ...(prev.answerMap || {}),
                        [currentQuestion._id]: option,
                    },
                };
            });

            toast.success('Answer recorded!', {
                icon: <CheckCircle size={18} className="text-emerald-500" />,
                style: { background: '#1E293B', color: '#10B981', border: '1px solid #059669' },
            });
        } catch (error) {
            setHasSubmitted(false);
            setSelectedOption('');
            toast.error(error.response?.data?.message || 'Failed to submit answer');
        }
    };

    const handleNextQuestion = async () => {
        if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
            autoAdvanceTimeoutRef.current = null;
        }

        await advanceToNextQuestion();
    };

    const handleCloseLobby = async () => {
        if (!lobby || !isHost) {
            return;
        }

        try {
            await api.patch(`/lobbies/${id}/close`);
            navigate('/lobbies');
        } catch {
            console.error('Failed to close lobby');
        }
    };

    const handleRestartQuiz = async () => {
        if (!lobby || !isHost) {
            return;
        }

        try {
            const { data } = await api.patch(`/lobbies/${id}/restart`);
            setLobby((prevLobby) => (
                prevLobby
                    ? {
                        ...prevLobby,
                        currentQuestionIndex: data.currentQuestionIndex,
                        questionStartedAt: data.questionStartedAt,
                        status: 'active',
                    }
                    : prevLobby
            ));
            setQuizEnded(false);
            setShowResults(false);
            setHasSubmitted(false);
            setSelectedOption('');
            toast.success('Quiz restarted. Attempt again from Question 1.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to restart quiz');
        }
    };

    if (!lobby || !currentQuestion) {
        return (
            <div className="container mx-auto p-4 max-w-6xl flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-bg border-t-brand-primary rounded-full animate-spin"></div>
                    <p className="text-brand-muted font-medium animate-pulse">Initializing Interview Room...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-6xl">
            {quizEnded && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.15}
                    colors={['#F97316', '#3B82F6', '#10B981', '#FCD34D']}
                />
            )}

            <div className="bg-brand-surface rounded-xl shadow-lg border border-brand-border p-5 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-text flex items-center gap-3">
                        {lobby.title}
                        <span className="text-[10px] bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                            {lobby.topic}
                        </span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
                        <span className="text-brand-muted flex items-center gap-1.5">
                            <Crown size={14} className="text-amber-500" />
                            <span className="text-brand-text">{lobby.host.name}</span>
                        </span>
                        <span className="text-brand-border">|</span>
                        <span className="text-brand-muted flex items-center gap-1.5">
                            <Users size={14} />
                            <span className="text-brand-text">{lobby.members.length}/{lobby.maxMembers}</span>
                        </span>
                        <span className="text-brand-border">|</span>
                        <span className="text-brand-muted">
                            <span className="text-brand-text font-semibold">{questions.length}</span> questions x{' '}
                            <span className="text-brand-text font-semibold">{lobby.questionTimeLimit}s</span> each
                        </span>
                    </div>
                    <div className="mt-2 text-xs text-brand-muted">
                        {userAttempt.completed
                            ? `Attempt ${userAttempt.attemptNo} completed. Select an option to start Attempt ${userAttempt.attemptNo + 1}.`
                            : `Attempt ${userAttempt.attemptNo} • Progress: ${userAttempt.answeredCount}/${userAttempt.totalQuestions || questions.length} answered. Resume point: Q${userAttempt.stoppedAtQuestionNumber || 1}`}
                    </div>
                </div>

                {isHost && (
                    <div className="flex gap-3">
                        {quizEnded && (
                            <button
                                onClick={handleRestartQuiz}
                                className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-5 py-2.5 rounded-xl font-bold transition-all border border-emerald-500/30 shadow-sm"
                            >
                                Restart Quiz <ChevronRight size={18} />
                            </button>
                        )}
                        {showResults && !quizEnded && (
                            <button
                                onClick={handleNextQuestion}
                                className="flex items-center gap-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue px-5 py-2.5 rounded-xl font-bold transition-all border border-brand-blue/30 shadow-sm"
                            >
                                Next Question Now <ChevronRight size={18} />
                            </button>
                        )}
                        <button
                            onClick={handleCloseLobby}
                            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-5 py-2.5 rounded-xl font-bold transition-all border border-red-500/20"
                        >
                            <XCircle size={18} /> End Session
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-brand-surface rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-brand-border flex flex-col min-h-[450px] relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-bg">
                            <Motion.div
                                className="h-full bg-gradient-to-r from-brand-primary to-brand-primaryHover"
                                initial={{ width: 0 }}
                                animate={{ width: `${((lobby.currentQuestionIndex + (showResults ? 1 : 0)) / questions.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-bg/30">
                            <span className="font-bold text-brand-muted uppercase tracking-widest text-xs flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                                Question {lobby.currentQuestionIndex + 1} of {questions.length}
                            </span>
                            <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-1.5 rounded-lg border ${timeLeft <= 10 && !showResults ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-brand-bg text-brand-text border-brand-border shadow-inner'}`}>
                                <Timer size={20} className={timeLeft <= 10 && !showResults ? 'text-red-500' : 'text-brand-muted'} /> {timeLeft}s
                            </div>
                        </div>

                        <div className="p-8 flex-grow flex flex-col justify-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-brand-text text-center mb-10 leading-relaxed max-w-2xl mx-auto">
                                {questionPrompt}
                            </h2>

                            {questionDescription && (
                                <p className="text-brand-muted text-center max-w-2xl mx-auto mb-8 leading-relaxed">
                                    {questionDescription}
                                </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AnimatePresence>
                                    {questionOptions.map((option, index) => {
                                        let buttonStyle = 'bg-brand-bg border border-brand-border text-brand-text hover:border-brand-primary/50 hover:bg-brand-primary/5';
                                        let Dot = () => (
                                            <div className="w-6 h-6 rounded-full border border-brand-muted/30 flex items-center justify-center text-xs font-bold text-brand-muted mr-3 bg-brand-surface">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                        );

                                        if (hasSubmitted && selectedOption === option) {
                                            buttonStyle = 'bg-brand-primary/10 border-brand-primary text-brand-text font-bold shadow-[0_0_20px_rgba(249,115,22,0.15)] ring-1 ring-brand-primary';
                                            Dot = () => (
                                                <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-xs font-bold text-white mr-3 shadow-md">
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                            );
                                        }

                                        return (
                                            <Motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: index * 0.1 }}
                                                key={index}
                                                disabled={hasSubmitted || showResults}
                                                onClick={() => submitAnswer(option)}
                                                className={`p-5 rounded-xl text-lg transition-all duration-300 shadow-sm ${buttonStyle} disabled:cursor-not-allowed text-left flex items-center group`}
                                            >
                                                <Dot />
                                                <span className="flex-grow">{option}</span>
                                            </Motion.button>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {questionOptions.length === 0 && (
                                <div className="mt-6 rounded-xl border border-dashed border-brand-border bg-brand-bg/40 p-5 text-center text-brand-muted">
                                    No answer choices are available for this question yet.
                                </div>
                            )}

                            <AnimatePresence>
                                {showResults && (
                                    <Motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                                        className="p-5 bg-gradient-to-r from-brand-primary/10 to-transparent border-l-4 border-brand-primary rounded-r-xl text-brand-text font-medium flex items-center gap-3"
                                    >
                                        <Info className="text-brand-primary" size={24} />
                                        <div>
                                            <p className="font-bold text-brand-primary mb-1">
                                                {quizEnded ? 'Interview Session Complete!' : 'Time is up!'}
                                            </p>
                                            <p className="text-sm opacity-80">
                                                {quizEnded
                                                    ? 'Great job everyone. Check the final scoreboard.'
                                                    : 'Answers are locked in. The next question starts automatically in a moment.'}
                                            </p>
                                        </div>
                                    </Motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Motion.div>
                </div>

                <div className="space-y-6">
                    <div className="bg-brand-surface rounded-2xl shadow-lg border border-brand-border overflow-hidden">
                        <div className="bg-gradient-to-r from-brand-primary to-brand-primaryHover text-white p-5 flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2"><Trophy size={18} /> Live Scoreboard</h3>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm text-sm font-bold shadow-inner">
                                {scoreboard.length}
                            </div>
                        </div>
                        <div className="p-0">
                            {scoreboard.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center justify-center gap-3 bg-brand-bg/50">
                                    <div className="w-12 h-12 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center">
                                        <Users size={20} className="text-brand-muted" />
                                    </div>
                                    <p className="text-brand-muted text-sm font-medium">Waiting for answers...</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-brand-border/50">
                                    <AnimatePresence>
                                        {scoreboard.map((entry, index) => (
                                            <Motion.li
                                                layout
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={`${entry.name}-${index}`}
                                                className="flex justify-between items-center p-4 hover:bg-brand-bg/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={`w-6 text-center font-bold ${index === 0 ? 'text-amber-400 text-lg' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-700' : 'text-brand-muted text-sm'}`}>
                                                        {index === 0 ? <Crown size={16} className="mx-auto" /> : index + 1}
                                                    </span>
                                                    <span className="font-medium text-brand-text">{entry.name}</span>
                                                </div>
                                                <span className="font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-full text-sm shadow-sm">
                                                    {entry.score} pts
                                                </span>
                                            </Motion.li>
                                        ))}
                                    </AnimatePresence>
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="bg-brand-surface rounded-2xl shadow-lg border border-brand-border overflow-hidden">
                        <div className="border-b border-brand-border p-5 bg-brand-bg/50">
                            <h3 className="font-bold text-brand-text flex items-center gap-2 text-sm uppercase tracking-wider">
                                <Users size={16} className="text-brand-muted" /> Participants connected
                            </h3>
                        </div>
                        <ul className="divide-y divide-brand-border max-h-64 overflow-y-auto p-2">
                            {lobby.members.map((member) => (
                                <li key={member._id} className="p-3 flex items-center gap-3 text-sm text-brand-text rounded-xl hover:bg-brand-bg/80 transition-colors cursor-default">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-bg to-brand-surface border border-brand-border flex items-center justify-center text-brand-primary font-bold shadow-inner">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-grow flex flex-col leading-tight">
                                        <span className="font-medium">{member.name}</span>
                                        {member._id === user._id && <span className="text-brand-muted text-[11px] font-medium mt-0.5">You</span>}
                                    </div>
                                    {member._id === lobby.host._id && (
                                        <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center" title="Host">
                                            <Crown size={12} className="text-amber-500" />
                                        </div>
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
