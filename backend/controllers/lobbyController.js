import Lobby from '../models/Lobby.js';
import User from '../models/User.js';

// @desc    Create a new lobby
// @route   POST /api/lobbies
// @access  Private
export const createLobby = async (req, res, next) => {
    try {
        const { title, topic, description, maxMembers } = req.body;

        const lobby = await Lobby.create({
            title,
            topic,
            description,
            maxMembers: maxMembers || 5,
            host: req.user._id,
            members: [req.user._id],
        });

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
        const lobby = await Lobby.findById(req.params.id).populate('host', 'name email').populate('members', 'name');

        if (lobby) {
            res.json(lobby);
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

        if (lobby.members.includes(req.user._id)) {
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

        lobby.currentQuestionIndex += 1;
        await lobby.save();

        res.json({ currentQuestionIndex: lobby.currentQuestionIndex });
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
