import mongoose, { Model, Schema, Types } from "mongoose";

export interface ICartItem {
    productId: Types.ObjectId;
    color: string;
    size: 'P' | 'M' | 'G' | 'GG';
    quantity: number;
}

export interface ICart extends Document {
    userId?: Types.ObjectId;
    sessionId?: string;
    items: ICartItem[];
    expiresAt?: Date;   
}

const cartSchema = new Schema<ICart>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true}, // Sparse -> ignora os documentos onde o userId não existe
    // Se não tiver userId, quer dizer que o usuário não está logado, então ele ganha um sessionId, ou seja, é um "convidado"
    sessionId: { type: String, sparse: true, unique: true}, 
    items: [{
        _id: false,
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true},
        color: { type: String, required: true},
        size: { type: String, required: true, enum: ['P', 'M', 'G', 'GG'] },
        quantity: { type: Number, required: true, min: 1},
    }],
    expiresAt: { type: Date, default: () => new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) }
}, {timestamps: true});

//TTL Index - Time-to-live
cartSchema.index(
    { expiresAt: 1 },
    { 
        expireAfterSeconds: 0,
        partialFilterExpression: { userId: { $exists: false } }
    }
);

export default mongoose.model<ICart>('Cart', cartSchema);