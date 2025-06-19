import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface que define os campos obrigatórios e opcionais de um produto
// Estende Document para incluir os métodos e propriedades do mongoose
export interface IProduct extends Document { 
    name: string;           // Nome do produto (obrigatório)
    description: string;    // Descrição do produto (obrigatório)
    price: number;          // Preço do produto (obrigatório)
    stock: number           // Quantidade em estoque (obrigatório)
    imageUrl?: string;      // URL da imagem do produto (opcional)
    createdAt: Date;        // Data de criação (gerado automaticamente pelo mongoose)
    updatedAt: Date;        // Data de atualização (gerado automaticamente pelo mongoose)
}

// Define o schema do produto, mapeando os campos para o MongoDB
const productSchema = new Schema<IProduct>({ 
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    imageUrl: { type: String },
}, {
    timestamps: true,         // Adiciona createdAt e updatedAt automaticamente
    collection: 'products'    // Define o nome da coleção no banco
});

// Exporta o model Product para ser usado nos services/controllers
export default mongoose.model('Product', productSchema)