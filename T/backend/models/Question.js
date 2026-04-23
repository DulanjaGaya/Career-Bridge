import mongoose from 'mongoose';

const questionSchema = mongoose.Schema(
    {
        topic: { type: String, required: true },
        text: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true },
        difficulty: { type: String, required: true },
        timeLimit: { type: Number, required: true, default: 30 },
    },
    { timestamps: true }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;
