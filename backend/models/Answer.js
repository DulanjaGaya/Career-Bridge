import mongoose from 'mongoose';

const answerSchema = mongoose.Schema(
    {
        lobbyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Lobby' },
        questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        attemptNo: { type: Number, required: true, default: 1 },
        selectedOption: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
    },
    { timestamps: true }
);

const Answer = mongoose.model('Answer', answerSchema);
export default Answer;
