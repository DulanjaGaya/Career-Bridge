import mongoose from 'mongoose';

const progressSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        resourceId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Resource' },
        completedAt: { type: Date, default: Date.now },
        notes: { type: String }
    },
    { timestamps: true }
);

progressSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
