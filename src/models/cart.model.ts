import mongoose, { Model, Schema, Types } from "mongoose";

export interface ICartItem {
    productId: Types.ObjectId;
    color: string;
    size: 'P' | 'M' | 'G' | 'GG';
    quantity: number;
}

export interface ICart extends Document {
    userId: Types.ObjectId;
    items: ICartItem[];
}

const cartSchema = new Schema<ICart>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [{
        _id: false,
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        color: { type: String, required: true },
        size: { type: String, required: true, enum: ['P', 'M', 'G', 'GG'] },
        quantity: { type: Number, required: true, min: 1 },
    }],
}, {
    timestamps: true
});


export default mongoose.model<ICart>('Cart', cartSchema);