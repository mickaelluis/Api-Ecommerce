import Product, { IProduct } from '../models/product.model';
import Category, { ICategory } from '../models/category.model';

// Processa os dados de um produto, convertendo os preços para centavos
function processProductPrices(productData: Partial<IProduct>): Partial<IProduct> {
    // Retorna imediatamente se não houver variantes de cor para processar
    if (!productData.colorVariants) {
        return productData;
    }

    // Usa .map() para criar um novo array de variantes com os preços processados
    const processedVariants = productData.colorVariants.map(variant => {
        // Se a variante não tiver tamanhos, retorna a variante original
        if (!variant.sizes) {
            return variant;
        }

        // Para cada tamanho, converte o preço para centavos.
        const processedSizes = variant.sizes.map(sizeInfo => {
            // Se o preço não for fornecido, retorna o objeto de tamanho original
            if (sizeInfo.price === undefined) {
                return sizeInfo;
            }

            const priceAsNumber = Number(sizeInfo.price);
            if (isNaN(priceAsNumber)) {
                throw new Error(`Preço inválido fornecido: '${sizeInfo.price}'`);
            }

            // Usa Math.trunc para converter para centavos sem arredondamentos indesejados
            const priceInCents = Math.round(priceAsNumber * 100);
            return { ...sizeInfo, price: priceInCents };
        });

        // Retorna a variante com seu array de tamanhos já processado
        return { ...variant, sizes: processedSizes };
    });

    // Retorna uma cópia final dos dados do produto com as variantes processadas
    return { ...productData, colorVariants: processedVariants };
}

const ProductService = {
    getAllProducts: async (): Promise<IProduct[]> => { // Busca todos os produtos cadastrados no banco
        return await Product.find().populate<ICategory>('category', '_id name description'); // Popula categoria com id, name e description
    },
    getProductById: async (id: string): Promise<IProduct | null> => { // Busca produto por id
        return await Product.findById(id).populate<ICategory>('category', '_id name description');
    },
    createProduct: async (productData: Partial<IProduct>): Promise<IProduct> => { // Cria um novo produto (uso do Partial pra não passar campos que nao precisam ser passados manualmente)
        // Processa os dados recebidos
        const processedData = processProductPrices(productData)
        const newProduct = new Product(processedData);
        return await newProduct.save();
    },
    updateProduct: async (
        id: string, 
        productData: Partial<IProduct>
    ): Promise<IProduct | null> => { // Atualiza um produto pelo id
        const processedData = processProductPrices(productData)
        return await Product.findByIdAndUpdate(id, processedData, { new: true });
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
                filter['colorVariants.sizes.price'].$gte = Math.round(params.minPrice * 100); // Maior ou igual ao min (Converte o preço em centavos)
            }
            if (params.maxPrice) {
                filter['colorVariants.sizes.price'].$lte = Math.round(params.maxPrice * 100); // Menor ou igual ao max (Converte o preço em centavos)
            }
        }
        // Realiza a busca no banco com os filtros montados e popula as categorias
        return await Product.find(filter).populate<ICategory>('category', '_id name description');
    },

}

export default ProductService; 