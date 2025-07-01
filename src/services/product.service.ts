import Product, { IProduct } from '../models/product.model';
import Category, { ICategory } from '../models/category.model';
import mongoose from 'mongoose';

const ProductService = {
    getAllProducts: async (): Promise<IProduct[]> => { // Busca todos os produtos cadastrados no banco
        return await Product.find().populate<ICategory>('category', '_id name description'); // Popula categoria com id, name e description
    },
    getProductById: async (id: string): Promise<IProduct | null> => { // Busca produto por id
        return await Product.findById(id).populate<ICategory>('category', '_id name description');
    },
    createProduct: async (productData: Partial<IProduct>): Promise<IProduct> => { // Cria um novo produto (uso do Partial pra não passar campos que nao precisam ser passados manualmente)
        const newProduct = new Product(productData);
        return await newProduct.save();
    },
    updateProduct: async (id: string, productData: Partial<IProduct>): Promise<IProduct | null> => { // Atualiza um produto pelo id
        return await Product.findByIdAndUpdate(id, productData, { new: true });
    },
    deleteProduct: async (id: string): Promise<IProduct | null> => { // Deleta um produto pelo id
        return await Product.findByIdAndDelete(id);
    },
    searchProducts: async (params: {
        name?: string;       // Busca por nome (parcial e case-insensitive)
        category?: string;   // Busca por categoria (exata)
        minPrice?: number;   // Preço mínimo
        maxPrice?: number;   // Preço máximo
    }): Promise<IProduct[]> => {
        const filter: any = {} // Objeto de filtros para passar ao Mongo

        if (params.name) {  // Se foi enviado "name", busca usando (regex), ignorando letras maiúsculas
            filter.name = { $regex: params.name, $options: 'i' };
        }

        if (params.category) {  // Se foi enviada uma "category", faz uma busca na coleção Category para pegar o _id correspondente
            const categoryFound = await Category.findOne({ name: { $regex: params.category, $options: 'i' } });

            if (categoryFound) { // Se encontrou a categoria, adiciona o id dela como filtro
                filter.category = categoryFound._id;
            }
        }

        if (params.minPrice || params.maxPrice) { // Filtros do preço - min ou max
            filter['colorVariants.sizes.price'] = {}; // Acessa todos os prices dentro de size
            if (params.minPrice) {
                filter['colorVariants.sizes.price'].$gte = params.minPrice; // Maior ou igual ao min
            }
            if (params.maxPrice) {
                filter['colorVariants.sizes.price'].$lte = params.maxPrice; // Menor ou igual ao max
            }
        }
        // Realiza a busca no banco com os filtros montados e popula as categorias
        return await Product.find(filter).populate<ICategory>('category', '_id name description');
    },

    // Métodos de estoque:

    finalizePurchase: async (
        productId: string,
        color: string,
        size: 'P' | 'M' | 'G' | 'GG',
        quantity: number
    ): Promise<{ success: boolean; message: string }> => {
        if (quantity <= 0) {
            return { success: false, message: 'Quantidade deve ser um número positivo' };
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) { // Verifica a formatação do ID
            return { success: false, message: 'ID de produto inválido' };
        }

        try {
            const updateResult = await Product.updateOne(
                {
                    _id: productId,
                    "colorVariants": {
                        $elemMatch: {// Pega o elemento que satisfazer as duas condições: Size é igual size? stock.reserved é maior ou igual a quantidade?
                            "sizes": { $elemMatch: { size: size, "stock.reserved": { $gte: quantity } } }
                        }
                    }
                },
                { // Decrementa o estoque reservado.
                    $inc: {
                        __v: 1,
                        "colorVariants.$[cv].sizes.$[sz].stock.reserved": -quantity
                    }
                },
                { // Direciona a atualização para os subdocumentos corretos.
                    arrayFilters: [
                        { "cv.color": color },
                        { "sz.size": size }
                    ]
                }
            );

            if (updateResult.modifiedCount === 0) { // modifiedCount vem do updateOne
                return { success: false, message: 'Reserva de estoque não encontrada para finalizar a compra.' }
            }

            return { success: true, message: 'Compra finalizada e estoque atualizado.' }
        } catch (error) {
            console.error('Erro ao finalizar compra:', { error, productId, quantity });
            return { success: false, message: 'Erro interno ao finalizar a compra.' };
        }
    },

    restock: async (
        productId: string,
        color: string,
        size: 'P' | 'M' | 'G' | 'GG',
        quantity: number
    ): Promise<{ success: boolean; message: string }> => {
        if (quantity <= 0) {
            return { success: false, message: 'Quantidade para repor deve ser um número positivo' };
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) { // Verifica a formatação do ID
            return { success: false, message: 'ID de produto inválido' };
        }

        try {
            const updateResult = await Product.updateOne(
                {
                    _id: productId,
                    "colorVariants": {
                        $elemMatch: { //  stock.available é maior ou igual a quantidade?
                            "sizes": { $elemMatch: { size: size, "stock.available": { $gte: quantity } } }
                        }
                    }
                },
                { // Incrementa o estoque DISPONÍVEL e a versão do documento.
                    $inc: {
                        __v: 1,
                        "colorVariants.$[cv].sizes.$[sz].stock.available": quantity
                    }
                },
                { // Direciona a atualização para os subdocumentos corretos.
                    arrayFilters: [
                        { "cv.color": color },
                        { "sz.size": size }
                    ]
                }
            );

            if (updateResult.modifiedCount === 0) { // modifiedCount vem do updateOne
                return { success: false, message: 'Produto não encontrado para adicionar ao estoque.' }
            }

            return { success: true, message: 'Estoque adicionado com sucesso.' }
        } catch (error) {
            console.error('Erro ao adicionar estoque:', { error, productId, quantity });
            return { success: false, message: 'Erro interno ao adicionar estoque.' };
        }
    },

    reserveStock: async (
        productId: string,
        color: string,
        size: 'P' | 'M' | 'G' | 'GG',
        quantity: number
    ): Promise<{ success: boolean; message: string }> => {
        if (quantity <= 0) {
            return { success: false, message: 'Quantidade deve ser um núnero positivo.' };
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) { // Verifica a formatação do ID
            return { success: false, message: 'ID de produto inválido' };
        }

        try {
            const updateResult = await Product.updateOne(
                {
                    _id: productId,
                    "colorVariants": {
                        $elemMatch: { //  stock.available é maior ou igual a quantidade?
                            "sizes": { $elemMatch: { size: size, "stock.available": { $gte: quantity } } }
                        }
                    }
                },
                { // Incrementa o estoque DISPONÍVEL e a versão do documento.
                    $inc: {
                        __v: 1,
                        "colorVariants.$[cv].sizes.$[sz].stock.available": -quantity,
                        "colorVariants.$[cv].sizes.$[sz].stock.reserved": quantity
                    }
                },
                { // Direciona a atualização para os subdocumentos corretos.
                    arrayFilters: [
                        { "cv.color": color },
                        { "sz.size": size }
                    ]
                }
            );

            if (updateResult.modifiedCount === 0) {
                return { success: false, message: 'Estoque indisponível pra reserva.' };
            }

            return { success: true, message: 'Estoque reservado com sucesso.' };
        } catch (error) {
            console.error('Erro ao reservar estoque:', { error, productId, quantity });
            return { success: false, message: 'Erro interno ao reservar estoque.' };
        }
    }

}

export default ProductService; 