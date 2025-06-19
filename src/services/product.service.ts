// Métodos pra criar:
// getAllProducts , getProductById --> clique, searchProducts, createProduct, updateProduct, deleteProduct

import  Product, { IProduct } from '../models/product.model';

const ProductService = {
    getAllProducts: async (): Promise<IProduct[]> => {
        return await Product.find();
    },
    getProductById: async (id: string): Promise<IProduct | null> => {
        return await Product.findById(id);
    },
    createProduct: async (productData: Partial<IProduct>): Promise<IProduct> => {
        const newProduct = new Product(productData);
        return await newProduct.save();
    },
    updateProduct: async (id: string, productData: Partial<IProduct>): Promise<IProduct | null> => {
        return await Product.findByIdAndUpdate(id, productData, { new: true});
    },
    deleteProduct: async (id: string): Promise<IProduct | null> => {
        return await Product.findByIdAndDelete(id);
    },
    searchProducts: async (params: {  // Ajustar searchProducts depois de fazer as categorias
        name?: string;       // Busca por nome (parcial e case-insensitive)
        category?: string;   // Busca por categoria (exata)
        minPrice?: number;   // Preço mínimo
        maxPrice?: number;   // Preço máximo
    }): Promise<IProduct[]> => {
        const filter: any = {}

        if(params.name) {
            filter.name = { $regex: params.name, $options: 'i'}
        }  
        if(params.category) {
            filter.category = { $regex: params.category, $options: 'i'}
        }
        if(params.minPrice || params.maxPrice) {
            filter.price = {};
            if(params.minPrice) {
                filter.price.$gte = params.minPrice
            }
            if(params.maxPrice) {
                filter.price.$lte = params.maxPrice
            }
        }

        return await Product.find(filter) as IProduct[];
    }
     
}



export default ProductService;