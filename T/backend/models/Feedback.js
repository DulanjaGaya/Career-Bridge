import mongoose from 'mongoose';

const feedbackSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        resourceId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Resource' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String }
    },
    { timestamps: true }
);

feedbackSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
