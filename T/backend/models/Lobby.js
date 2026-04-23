import mongoose from 'mongoose';

const lobbySchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        topic: { type: String, required: true },
        description: { type: String },
        maxMembers: { type: Number, required: true, default: 5 },
        host: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
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
