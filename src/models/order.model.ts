import mongoose, { Model, Schema, Types } from "mongoose";
import { IProduct } from "./product.model";

export interface IOrderItem {
    productId: Types.ObjectId | IProduct;
    color: string;
    size: 'P' | 'M' | 'G' | 'GG';
    quantity: number;
    price: number;
};

export interface IOrder {
    userId: Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELED' | 'EXPIRED';
    // shippingAdress: {} // Endereço usado para entrega
    expiresAt?: Date;
};

const orderSchema = new Schema<IOrder>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        color: { type: String, required: true },
        size: { type: String, required: true, enum: ['P', 'M', 'G', 'GG'] },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['PENDING_PAYMENT', 'PAID', 'CANCELED', 'EXPIRED'], default: 'PENDING_PAYMENT' },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 15 * 60 * 1000), // Expira em 15 minutos
        index: { expires: '1m' } // TTL Index para limpeza automática pelo MongoDB}
    }
}, {
    timestamps: true
})

export default mongoose.model('Order', orderSchema);