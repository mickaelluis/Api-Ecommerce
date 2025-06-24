import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { ICategory } from './category.model';

export interface IColorVariant {
  color: string;
  media: {
    url: string;
    type: 'image' | 'video';
  }[];
  sizes: {
    size: 'P' | 'M' | 'G' | 'GG';
    stock: number;
  }[];
}



// Interface que define os campos obrigatórios e opcionais de um produto
// Estende Document para incluir os métodos e propriedades do mongoose
export interface IProduct extends Document {
    name: string;           // Nome do produto
    category: Types.ObjectId | ICategory; // Referenciando Categoria 
    description: string;    // Descrição do produto
    price: number;          // Preço do produto 
    colorVariants: IColorVariant[]; // Cor -> Tamanho -> Estoque --> Cada cor tem suas próprias URLs de imagens/video; 
    createdAt: Date;        // Data de criação (gerado automaticamente pelo mongoose)
    updatedAt: Date;        // Data de atualização (gerado automaticamente pelo mongoose)
}

// Define o schema do produto, mapeando os campos para o MongoDB
const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },

    colorVariants: [{
        _id: false,
        color: { type: String, required: true },
        media: [{
            _id: false,
            url: { type: String, required: true, trim: true },
            type: { type: String, required: true, enum: ['image', 'video'] }
        }],
        sizes: [{
            _id: false,
            size: { type: String, required: true, enum: ['P', 'M', 'G', 'GG'] },
            stock: { type: Number, required: true, min: 0, default: 0 }
        }]
    }]
}, {
    timestamps: true,
    collection: 'products'
});

// Exporta o model Product para ser usado nos services/controllers
export default mongoose.model('Product', productSchema)