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
}

export default ProductService;