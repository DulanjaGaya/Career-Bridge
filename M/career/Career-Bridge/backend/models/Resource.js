import mongoose from 'mongoose';

const resourceSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        topic: { type: String, required: true },
        type: { type: String, required: true }, // youtube, drive, pdf, article
        url: { type: String, required: true },
        description: { type: String },
        difficulty: { type: String },
    },
    { timestamps: true }
);

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
