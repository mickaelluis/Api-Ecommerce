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
                return item.productId.toString() === itemData.productId.toString() &&
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
            return { success: true, message: "Carrinho atualizado com sucesso.", data: updatedCart }
        } catch (error) {
            console.error('Erro ao atualizar carrinho do usuário:', error);
            return { success: false, message: `Erro interno ao atualizar carrinho.` }
        }
    },

    removeItem: async (userId: string, itemToRemove: Omit<ICartItem, 'quantity'>): Promise<{ success: boolean, message: string, data?: ICart }> => {
        try {
            let cart = await Cart.findOne({ userId: userId });

            if (!cart) { // Se não houver carrinho, não tem nada para remover
                return { success: false, message: 'Carrinho não encontrado.' }
            };
            // Guarda o número de itens antes da remoção
            const initialItemCount = cart.items.length;
            // Filtra o array de itens, mantendo apenas aqueles que NÃO correspondem ao item a ser removido
            cart.items = cart.items.filter(item =>
                !(
                    item.productId.toString() === itemToRemove.productId.toString() &&
                    item.color === itemToRemove.color &&
                    item.size === itemToRemove.size
                )
            );
            // Verifica se realmente foi removido
            if (cart.items.length === initialItemCount) {
                return { success: false, message: "Item não encontrado no carrinho." };
            }

            const updatedCart = await cart.save();
            return { success: true, message: "Item removido com sucesso", data: updatedCart }
        } catch (error) {
            console.error('Erro ao remover item do carrinho:', error)
            return { success: false, message: 'Erro interno ao remover item.' };
        }
    }

}

export default CartService;