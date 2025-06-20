import { strict } from 'assert';
import mongoose, { Document, model, ObjectId, Schema, Types } from 'mongoose';
import User from './user.model';
import Product from './product.model';

export interface IClients extends Document {
        Clients: ObjectId;
        CPF?: string;
        telefone?: Number;
        Location?:[
            {
            District?: string;
            Number?: number;
            Street?: string;
            cep?: number;
            }
        ];
        Favorites?: [{
            Products?: any
        }]
        Shopping?:[{
            idProducts?: string;
            Location?:{
                District?: string;
                Number?: number;
                Street?: string;
                cep?: number;
            };
            PaymentMethod?: {
                pix?: string;
                boleto?: string;
                cartaoCredito?: string;
                cartaoDebito?: string
            }
        }]
}


const ClientesSchema = new Schema<IClients>({
    Clients: { type: Types.ObjectId, ref: User, required: true },
    CPF: { type: String, default: '' },
    telefone: { type: Number, required: true, default: 0 },
    Location: [{
             District: { type: String, required: true, default: '' },
             Number: { type: Number, required: true, default: 0 },
             Street: { type: String, required: true, default: '' },
             cep: { type: Number, required: true, default: 0 },
          }],
    Favorites: [{
         Products: { type: Types.ObjectId, ref: Product, default: {} },
    }],
    Shopping:[{
        idProducts: { type: Types.ObjectId, ref: Product,default: {} },
        Location:{
            District:{ type: String, required: true, default: ''},
            Number: {type: Number, required: true, default: 0},
            Street: {type: String, required: true, default: ''},
            cep: {type: Number, required: true, default: 0 },
        },
    PaymentMethod: {
        pix: {type: String, required: true , default: ''},
        boleto: {type: String, required: true, default: ''},
        cartaoCredito: {type: String, required: true, default: ''},
        cartaoDebito: {type: String, required: true, default: ''},
    },
    }]
})

export default mongoose.model('clientes', ClientesSchema)
