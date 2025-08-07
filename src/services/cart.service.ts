import Cart, { ICart, ICartItem } from '../models/cart.model'
import Product, { IProduct } from '../models/product.model'

interface ServiceResponse {
    success: boolean,
    message: string,
    data?: ICart,
    statusCode: number
}

const CartService = {
    // Pega o carrinho pelo id do usuário
    getCartByUserId: async (userId: string): Promise<ICart | null> => {
        const cart = await Cart.findOne({ userId: userId }).populate('items.productId', 'name colorVariants').lean(); // Popula com nome - mídia e preço (dentro de colorVariants)

        if (!cart) {
            return null
        }

        cart.items = cart.items.map(item => {
            if (!item.productId) {
                return item
            };

            // O campo 'productId' agora contém o objeto completo do produto
            const product = item.productId as unknown as IProduct
            // Variante de cor e tamanho que o usuário escolheu
            const chosenColorVariant = product.colorVariants.find(i => i.color === item.color);
            const chosenSizeVariant = chosenColorVariant?.sizes.find(i => i.size === item.size);
            // Faz um novo produto retornando o que será utilizado:
            const newProduct = {
                _id: product.id,
                name: product.name,
                media: chosenColorVariant?.media[0] || null,
                price: chosenSizeVariant?.price || 0
            }

            return {
                ...item,
                productId: newProduct as any
            };
        });

        return cart as ICart;
    },
    // Adiciona um item ou atualiza sua quantidade
    upsertItem: async (userId: string, itemData: ICartItem): Promise<ServiceResponse> => {
        try {
            // Se a quantidade for menor ou igual a 0, utilizamos a função removeItem para remover esse item
            if (itemData.quantity <= 0) {
                return CartService.removeItem(userId, itemData);
            }
            // Validação do produto:
            // Verifica se o produto existe
            const product = await Product.findById(itemData.productId).lean();
            if (!product) {
                return { success: false, message: 'Produto não encontrado', statusCode: 404 }
            }
            // Verifica se tem a cor disponível
            const colorVariant = product.colorVariants.find(i => i.color === itemData.color);
            if (!colorVariant) {
                return { success: false, message: 'Cor não disponível para este produto.', statusCode: 404 };
            }
            // Verifica se tem o tamanho disponível
            const sizeVariant = colorVariant.sizes.find(i => i.size ===  itemData.size);
            if (!sizeVariant) {
                return { success: false, message: 'Tamanho não disponível para esta cor.', statusCode: 404 };
            }
            // Verifica se o estoque <disponível> tem quantidade suficiente
            if (sizeVariant.stock.available < itemData.quantity) {
                return { success: false, message: `Estoque insuficiente. Apenas ${sizeVariant.stock.available} unidades disponíveis.`, statusCode: 409 }
            }
            // Verifica se existe algum item igual e atualiza com $set
            const updatedCart = await Cart.findOneAndUpdate(
                {
                    userId: userId,
                    'items.productId': itemData.productId,
                    'items.color': itemData.color,
                    'items.size': itemData.size
                },
                // $set -> substitui o valor antigo pelo novo, se o campo não existe, $set cria com o valor fornecido
                // Utiliza-se o '$' para atualizar o campo 'quantity' do primeiro elemento do array 'items' que correspondeu à query
                { $set: { 'items.$.quantity': itemData.quantity } },
                { new: true }
            );

            // Se existir, retorna a quantidade atualizada
            if (updatedCart) {
                return { success: true, message: 'Quantidade do item atualizada.', statusCode: 200, data: updatedCart }
            }

            // Se o updateCart for nulo, quer dizer que é preciso adicionar o item no carrinho
            const cartWithNewItem = await Cart.findOneAndUpdate(
                { userId: userId },
                // $push adiciona um novo elemento ao final de um array existente
                { $push: { items: itemData } },
                // 'upsert: true' cria um novo carrinho para o usuário caso ele ainda não tenha um
                { new: true, upsert: true }
            );

            // '!' para garantir ao TypeScript que, devido ao 'upsert', este valor nunca será nulo aqui
            return { success: true, message: 'Item adicionado ao carrinho.', statusCode: 201, data: cartWithNewItem! }
        } catch (error) {
            console.error('Erro ao atualizar carrinho do usuário:', error);
            return { success: false, message: `Erro interno ao atualizar carrinho.`, statusCode: 500 }
        }
    },
    // Remove o item específicado do carrinho
    removeItem: async (userId: string, itemToRemove: Omit<ICartItem, 'quantity'>): Promise<ServiceResponse> => {
        try {
            const product = await Product.findById(itemToRemove.productId).lean();
            if (!product) {
                return { success: false, message: 'Produto não encontrado.', statusCode: 404 };
            }
            const colorVariant = product.colorVariants.find(i => i.color === itemToRemove.color);
            if (!colorVariant) {
                return { success: false, message: 'Cor não disponível para este produto.', statusCode: 404 };
            }
            const sizeVariant = colorVariant.sizes.find(i => i.size === itemToRemove.size);
            if (!sizeVariant) {
                return { success: false, message: 'Tamanho não disponível para esta cor.', statusCode: 404 };
            }

            const updatedCart = await Cart.findOneAndUpdate(
                { userId: userId },
                // $pull remove do array 'items' todos os elementos que corresponderem a condição
                { $pull: { items: { productId: itemToRemove.productId, color: itemToRemove.color, size: itemToRemove.size } } },
                // new: true -> devolve o documento depois da modificação 
                { new: true }
            );

            if (!updatedCart) { // Se não houver carrinho, não tem nada para remover
                return { success: false, message: 'Carrinho não encontrado.', statusCode: 404 }
            };

            return { success: true, message: 'Item removido do carrinho com sucesso', statusCode: 200, data: updatedCart }
        } catch (error) {
            console.error('Erro ao remover item do carrinho:', error)
            return { success: false, message: 'Erro interno ao remover item.', statusCode: 500 };
        }
    },

}

export default CartService;