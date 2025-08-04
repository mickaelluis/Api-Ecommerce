import Cart, { ICart, ICartItem } from '../models/cart.model'

const CartService = {
    // Pega o carrinho pelo id do usuário
    getCartByUserId: async (userId: string): Promise<ICart | null> => {
        return await Cart.findOne({ userId: userId }).populate('items.productId', 'name media') // Popula com nome e mídia
    },
    // Adiciona, atualiza ou remove um item do carrinho de um usuário
    upsertItem: async (userId: string, itemData: ICartItem): Promise<{ success: boolean, message: string, data?: ICart }> => {
        try {
            // Encontra o carrinho do usuário
            let cart = await Cart.findOne({ userId: userId });
            // Se não existir cria um novo carrinho
            if (!cart) {
                cart = new Cart({ userId: userId, items: [] });
            };
            // Procura o índice do item no carrinho pra saber se ele existe
            const existingItemIndex = cart.items.findIndex(item => {
                item.productId.toString() === itemData.productId.toString() &&
                item.color === itemData.color &&
                item.size === itemData.size
            });
            // Se existe, atualiza a quantidade
            if (existingItemIndex > -1) {
                // Se o item existe, atualiza sua quantidade ou o remove se a quantidade for <= 0.
                if (itemData.quantity > 0) {
                    cart.items[existingItemIndex].quantity = itemData.quantity;
                } else {
                    cart.items.splice(existingItemIndex, 1);
                }
            } else if (itemData.quantity > 0) {
                // Se o item não existe e a quantidade é positiva, adiciona-o ao carrinho.
                cart.items.push(itemData);
            }

            const updatedCart = await cart.save()
            return { success: true, message: "Carrinho atualizado com sucesso.", data: updatedCart}
        } catch (error) {
            console.error('Erro ao atualizar carrinho do usupário.', error);
            return { success: false, message: `Erro interno ao atualizar carrinho.`}
        }
    }
}

export default CartService;