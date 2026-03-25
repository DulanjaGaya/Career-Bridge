import mongoose from 'mongoose';

const answerSchema = mongoose.Schema(
    {
        lobbyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Lobby' },
        questionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Question' },
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        selectedOption: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
    },
    { timestamps: true }
);

const Answer = mongoose.model('Answer', answerSchema);
export default Answer;
