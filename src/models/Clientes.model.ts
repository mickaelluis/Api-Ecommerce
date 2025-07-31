import { strict } from 'assert';
import mongoose, { Document, model, ObjectId, Schema, Types } from 'mongoose';
import User from './user.model';
import Product from './product.model';
import { number } from 'zod';

export interface IClients extends Document {
        Clients: ObjectId;
        CPF?: String;
        telefone?: { 
             Number: String,
             auth: String,
     };
        Location?:[
            {
            District?: string;
            cep?: string;
            logradouro?: string;
            complemento?: string;
            unidade?: string;
            bairro?: string;
            localidade?: string;
            estado?: string;
            regiao?: string;
            }
        ];
        Favorites?: [{     
                productId: ObjectId ,
                name:  String ,
                description: String,
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


const ClientsSchema = new Schema<IClients>({
    Clients: { type: Types.ObjectId, ref: User, required: true },
    CPF: { type: String, default: 0 },
    telefone: { 
        Number: {type: String, required: true, default: 0, unique: true},
        auth: {type: String, required: true, default: 'false', unique: true},
     },
    Location: [{
             _id: false,
             cep:{ type: String, required: true, default: '' },
             logradouro:{ type: String, required: true, default: '' },
             complemento:{ type: String, required: true, default: '' },
             unidade:{ type: String, required: true, default: '' },
             bairro:{ type: String, required: true, default: '' },
             localidade:{ type: String, required: true, default: '' },
             estado:{ type: String, required: true, default: '' },
             regiao:{ type: String, required: true, default: '' },
          }],
    Favorites: [{
             _id: false,
             Productid:{ type: Types.ObjectId, required: true, default: null },
             name:{ type: String, required: true, default: '' },
             description:{ type: String, required: true, default: '' },
    }],
    Shopping:[{
        idProducts: { type: Types.ObjectId, ref: Product,required: true, default: {} },
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

export default mongoose.model('Clients', ClientsSchema) 
