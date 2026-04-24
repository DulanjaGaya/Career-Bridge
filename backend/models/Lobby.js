import mongoose from 'mongoose';

const lobbyQuestionSchema = new mongoose.Schema(
    {
        prompt: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        options: {
            type: [String],
            required: true,
            validate: {
                validator: (options) => Array.isArray(options) && options.length === 4,
                message: 'Each interview question must have exactly 4 options.',
            },
        },
        correctAnswer: { type: String, required: true, trim: true },
    },
    { timestamps: false }
);

const lobbySchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        topic: { type: String, required: true },
        description: { type: String },
        maxMembers: { type: Number, required: true, default: 5 },
        host: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        questions: [lobbyQuestionSchema],
        questionCount: { type: Number, required: true, default: 5 },
        questionTimeLimit: { type: Number, required: true, default: 10 },
        questionStartedAt: { type: Date, default: Date.now },
        currentQuestionIndex: { type: Number, default: 0 },
        status: { type: String, enum: ['active', 'closed'], default: 'active' },
    },
    { timestamps: true }
);

const Lobby = mongoose.model('Lobby', lobbySchema);
export default Lobby;
