import mongoose from 'mongoose';
import Lobby from '../models/Lobby.js';
import Answer from '../models/Answer.js';

const DEFAULT_QUESTION_TIME_LIMIT = 10;

const lobbyPopulate = [
    { path: 'host', select: 'name email' },
    { path: 'members', select: 'name' },
];

const toPositiveNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeInterviewQuestion = (question, index) => {
    const prompt = typeof question?.prompt === 'string' ? question.prompt.trim() : '';
    const description = typeof question?.description === 'string' ? question.description.trim() : '';
    const options = Array.isArray(question?.options)
        ? question.options.map((option) => (typeof option === 'string' ? option.trim() : '')).filter(Boolean)
        : [];
    const correctAnswer = typeof question?.correctAnswer === 'string' ? question.correctAnswer.trim() : '';

    if (!prompt) {
        throw new Error(`Question ${index + 1} needs a prompt`);
    }

    if (options.length !== 4) {
        throw new Error(`Question ${index + 1} must have exactly 4 options`);
    }

    if (new Set(options).size !== options.length) {
        throw new Error(`Question ${index + 1} options must be unique`);
    }

    if (!options.includes(correctAnswer)) {
        throw new Error(`Question ${index + 1} must have a correct answer selected from the options`);
    }

    return {
        prompt,
        description,
        options,
        correctAnswer,
    };
};

const normalizeInterviewQuestions = (questions) => {
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Please add at least one interview question');
    }

    return questions.map((question, index) => normalizeInterviewQuestion(question, index));
};

const ensureLobbyQuestions = async (lobby) => {
    const questionCount = Array.isArray(lobby.questions) ? lobby.questions.length : 0;

    if (questionCount === 0) {
        throw new Error('No questions available for this lobby');
    }

    if (lobby.currentQuestionIndex >= questionCount) {
        lobby.currentQuestionIndex = 0;
        lobby.questionStartedAt = new Date();
        await lobby.save();
    }

    return lobby;
};

const autoAdvanceLobbyByTime = async (lobby) => {
    await ensureLobbyQuestions(lobby);

    if (!lobby.questionStartedAt || lobby.questions.length === 0) {
        return lobby;
    }

    const timeLimit = toPositiveNumber(lobby.questionTimeLimit, DEFAULT_QUESTION_TIME_LIMIT);
    const startedAtMs = new Date(lobby.questionStartedAt).getTime();
    if (Number.isNaN(startedAtMs)) {
        lobby.questionStartedAt = new Date();
        await lobby.save();
        return lobby;
    }

    const elapsedSeconds = Math.floor((Date.now() - startedAtMs) / 1000);

    // If session is stale (e.g., demo room left idle), reset instead of jumping to last question.
    const fullQuizDuration = timeLimit * Math.max(lobby.questions.length, 1);
    if (elapsedSeconds >= fullQuizDuration) {
        lobby.currentQuestionIndex = 0;
        lobby.questionStartedAt = new Date();
        await lobby.save();
        return lobby;
    }

    if (elapsedSeconds < timeLimit) {
        return lobby;
    }

    const steps = Math.floor(elapsedSeconds / timeLimit);
    const maxIndex = Math.max(lobby.questions.length - 1, 0);
    const nextIndex = Math.min(lobby.currentQuestionIndex + steps, maxIndex);

    if (nextIndex !== lobby.currentQuestionIndex) {
        lobby.currentQuestionIndex = nextIndex;
        // Keep timer aligned to the currently active question window.
        const consumedMs = steps * timeLimit * 1000;
        lobby.questionStartedAt = new Date(startedAtMs + consumedMs);
        await lobby.save();
    }

    return lobby;
};

// @desc    Create a new lobby
// @route   POST /api/lobbies
// @access  Private
export const createLobby = async (req, res, next) => {
    try {
        const { title, topic, description, maxMembers, questionTimeLimit, questions } = req.body;
        const interviewQuestions = normalizeInterviewQuestions(questions);

        const lobby = await Lobby.create({
            title,
            topic,
            description,
            maxMembers: toPositiveNumber(maxMembers, 5),
            host: req.user._id,
            members: [req.user._id],
            questions: interviewQuestions,
            questionCount: interviewQuestions.length,
            questionTimeLimit: toPositiveNumber(questionTimeLimit, DEFAULT_QUESTION_TIME_LIMIT),
            questionStartedAt: new Date(),
        });

        await lobby.populate(lobbyPopulate);
        res.status(201).json(lobby);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all active lobbies
// @route   GET /api/lobbies
// @access  Public/Private
export const getLobbies = async (req, res, next) => {
    try {
        const lobbies = await Lobby.find({ status: 'active' }).populate('host', 'name email').populate('members', 'name');
        res.json(lobbies);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single lobby
// @route   GET /api/lobbies/:id
// @access  Private
export const getLobbyById = async (req, res, next) => {
    try {
        const lobby = await Lobby.findById(req.params.id).populate(lobbyPopulate);

        if (lobby) {
            await autoAdvanceLobbyByTime(lobby);
            await lobby.populate(lobbyPopulate);

            const answers = await Answer.find({
                lobbyId: lobby._id,
                userId: req.user._id,
            }).select('questionId selectedOption attemptNo');

            const questionIdOrder = lobby.questions.map((q) => q._id.toString());
            const latestAttemptNo = answers.reduce((max, ans) => Math.max(max, ans.attemptNo || 1), 1);
            const currentAttemptAnswers = answers.filter((ans) => (ans.attemptNo || 1) === latestAttemptNo);

            const answerMap = {};
            currentAttemptAnswers.forEach((ans) => {
                const qId = ans.questionId.toString();
                if (!answerMap[qId]) {
                    answerMap[qId] = ans.selectedOption;
                }
            });

            const answeredQuestionIds = Object.keys(answerMap);
            const answeredSet = new Set(answeredQuestionIds);
            const totalQuestions = questionIdOrder.length;
            const answeredCount = answeredQuestionIds.length;
            const completed = totalQuestions > 0 && answeredCount >= totalQuestions;

            const firstUnansweredIndex = questionIdOrder.findIndex((qId) => !answeredSet.has(qId));
            const stoppedAtQuestionIndex = completed
                ? Math.max(totalQuestions - 1, 0)
                : (firstUnansweredIndex === -1 ? 0 : firstUnansweredIndex);

            const lobbyData = lobby.toObject();
            lobbyData.userAttempt = {
                attemptNo: latestAttemptNo,
                answeredCount,
                totalQuestions,
                completed,
                answeredQuestionIds,
                answerMap,
                stoppedAtQuestionIndex,
                stoppedAtQuestionNumber: stoppedAtQuestionIndex + 1,
            };

            res.json(lobbyData);
        } else {
            res.status(404);
            throw new Error('Lobby not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Join a lobby
// @route   POST /api/lobbies/:id/join
// @access  Private
export const joinLobby = async (req, res, next) => {
    try {
        const lobby = await Lobby.findById(req.params.id);

        if (!lobby) {
            res.status(404);
            throw new Error('Lobby not found');
        }

        if (lobby.status === 'closed') {
            res.status(400);
            throw new Error('Lobby is closed');
        }

        const memberIds = lobby.members.map((memberId) => memberId.toString());
        if (memberIds.includes(req.user._id.toString())) {
            res.status(400);
            throw new Error('You are already in this lobby');
        }

        if (lobby.members.length >= lobby.maxMembers) {
            res.status(400);
            throw new Error('Lobby is full');
        }

        lobby.members.push(req.user._id);
        await lobby.save();

        res.json(lobby);
    } catch (error) {
        next(error);
    }
};

// @desc    Next Question
// @route   PATCH /api/lobbies/:id/next-question
// @access  Private
export const nextQuestion = async (req, res, next) => {
    try {
        const lobby = await Lobby.findById(req.params.id);

        if (!lobby) {
            res.status(404);
            throw new Error('Lobby not found');
        }

        if (lobby.host.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized as host');
        }

        await ensureLobbyQuestions(lobby);

        if (lobby.currentQuestionIndex + 1 >= lobby.questions.length) {
            res.status(400);
            throw new Error('No more questions in this lobby');
        }

        lobby.currentQuestionIndex += 1;
        lobby.questionStartedAt = new Date();
        await lobby.save();

        res.json({
            currentQuestionIndex: lobby.currentQuestionIndex,
            questionStartedAt: lobby.questionStartedAt,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Close a lobby
// @route   PATCH /api/lobbies/:id/close
// @access  Private
export const closeLobby = async (req, res, next) => {
    try {
        const lobby = await Lobby.findById(req.params.id);

        if (!lobby) {
            res.status(404);
            throw new Error('Lobby not found');
        }

        if (lobby.host.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized as host');
        }

        lobby.status = 'closed';
        await lobby.save();

        res.json(lobby);
    } catch (error) {
        next(error);
    }
};

// @desc    Restart quiz in lobby
// @route   PATCH /api/lobbies/:id/restart
// @access  Private (Host)
export const restartLobby = async (req, res, next) => {
    try {
        const lobby = await Lobby.findById(req.params.id);

        if (!lobby) {
            res.status(404);
            throw new Error('Lobby not found');
        }

        if (lobby.host.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized as host');
        }

        await ensureLobbyQuestions(lobby);

        lobby.currentQuestionIndex = 0;
        lobby.questionStartedAt = new Date();
        if (lobby.status === 'closed') {
            lobby.status = 'active';
        }

        await lobby.save();

        res.json({
            message: 'Lobby quiz restarted',
            currentQuestionIndex: lobby.currentQuestionIndex,
            questionStartedAt: lobby.questionStartedAt,
        });
    } catch (error) {
        next(error);
    }
};
