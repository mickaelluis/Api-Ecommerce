import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
};

const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: { type: String }
}, {
    timestamps: true
});

export default mongoose.model('Category', categorySchema)
