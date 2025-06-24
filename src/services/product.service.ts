import Product, { IProduct } from '../models/product.model';
import Category, { ICategory } from '../models/category.model';

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
    searchProducts: async (params: {  // Ajustar searchProducts depois de fazer as categorias
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

        if (params.minPrice || params.maxPrice) { // Filtros de preço - min ou maximo
            filter.price = {}; // Cria objeto price dentro do filtro

            if (params.minPrice) {
                filter.price.$gte = params.minPrice; // Maior ou igual ao min
            }
            if (params.maxPrice) {
                filter.price.$lte = params.maxPrice; // Menor ou igual ao max
            }
        }
        // Realiza a busca no banco com os filtros montados e popula as categorias
        return await Product.find(filter).populate<ICategory>('category', '_id name description');
    }

}

export default ProductService; 