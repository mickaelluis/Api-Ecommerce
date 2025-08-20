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
        // Total do carrinho
        let total = 0

        cart.items = cart.items.map(item => {
            if (!item.productId) {
                return item
            };

            // O campo 'productId' agora contém o objeto completo do produto
            const product = item.productId as unknown as IProduct
            // Variante de cor e tamanho que o usuário escolheu
            const chosenColorVariant = product.colorVariants.find(i => i.color === item.color);
            const chosenSizeVariant = chosenColorVariant?.sizes.find(i => i.size === item.size);

            const price = chosenSizeVariant?.price || 0
            const subtotal = price * item.quantity;
            total += subtotal

            // Faz um novo produto retornando o que será utilizado:
            const newProduct = {
                _id: product.id,
                name: product.name,
                media: chosenColorVariant?.media[0] || null,
                price: chosenSizeVariant?.price || 0
            }

            return {
                ...item,
                productId: newProduct as any,
                subtotal: subtotal
            };
        });

        // Adiciona a propriedade 'total' calculada ao objeto principal do carrinho (usamos o any para conseguir adicionar a propriedade total)
        (cart as any).total = total;
        // Retorna o objeto de carrinho completo e formatado.
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
            const sizeVariant = colorVariant.sizes.find(i => i.size === itemData.size);
            if (!sizeVariant) {
                return { success: false, message: 'Tamanho não disponível para esta cor.', statusCode: 404 };
            }
            // Verifica se o estoque <disponível> tem quantidade suficiente
            if (sizeVariant.stock.available < itemData.quantity) {
                return { success: false, message: `Estoque insuficiente. Apenas ${sizeVariant.stock.available} unidades disponíveis.`, statusCode: 409 }
            }
            // Busca o carrinho
            const cart = await Cart.findOne({ userId });
            // Se o carrinho já existe, busca pelo item, para atualizá-lo
            if (cart) {
                const itemInCart = cart.items.find(item =>
                    item.productId.toString() === itemData.productId.toString() &&
                    item.color === itemData.color &&
                    item.size === itemData.size
                );
                // Se o item existe incrementa a quantidadee
                if (itemInCart) {
                    itemInCart.quantity = itemData.quantity;
                    const updatedCart = await cart.save();

                    return { success: true, message: 'Quantidade do item atualizada.', statusCode: 200, data: updatedCart };
                }
            }

            // Se o item é novo (ou o carrinho), adiciona o item com a quantida específicada 
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

    incrementItem: async (userId: string, itemData: Omit<ICartItem, 'quantity'>): Promise<ServiceResponse> => {
        try {
            const product = await Product.findById(itemData.productId).lean();
            if (!product) {
                return { success: false, message: 'Produto não encontrado.', statusCode: 404 };
            }
            const colorVariant = product.colorVariants.find(i => i.color === itemData.color);
            if (!colorVariant) {
                return { success: false, message: 'Cor não disponível para este produto.', statusCode: 404 };
            }
            const sizeVariant = colorVariant.sizes.find(i => i.size === itemData.size);
            if (!sizeVariant) {
                return { success: false, message: 'Tamanho não disponível para esta cor.', statusCode: 404 };
            }
            // Busca o carrinho 
            const cart = await Cart.findOne({ userId });
            // Caminho 1 -> O carrinho já existe, verifica se o item já está nele
            if (cart) {
                const itemInCart = cart.items.find(item =>
                    item.productId.toString() === itemData.productId.toString() &&
                    item.color === itemData.color &&
                    item.size === itemData.size
                );
                // Se o item existe incrementa a quantidadee
                if (itemInCart) {
                    // Validação de estoque       
                    if (sizeVariant.stock.available <= itemInCart.quantity) {
                        return { success: false, message: `Estoque insuficiente para ${product.name}.`, statusCode: 409 };
                    }
                    // Incrementa a quantidade do item específicado e salva o documento
                    itemInCart.quantity += 1;
                    const updatedCart = await cart.save();

                    return { success: true, message: 'Item incrementado.', statusCode: 200, data: updatedCart };
                }
            }

            // Caminho 2 -> item não existe no carrinho ou carrinho não existe, item novo (ou o carrinho é novo)
            // Validação de estoque para um item novo
            if (sizeVariant.stock.available < 1) {
                return { success: false, message: `Estoque insuficiente para ${product.name}.`, statusCode: 409 };
            }
            // Se o item não existia, adicona ao carrinho com quantidade 1
            const cartWithNewItem = await Cart.findOneAndUpdate(
                { userId },
                { $push: { items: { ...itemData, quantity: 1 } } },
                { new: true, upsert: true }
            )

            return { success: true, message: 'Item adicionado ao carrinho.', statusCode: 201, data: cartWithNewItem }
        } catch (error) {
            console.error('Erro ao incrementar item:', error)
            return { success: false, message: 'Erro interno ao adicionar item.', statusCode: 500 };
        }
    },

    decrementItem: async (userId: string, itemData: Omit<ICartItem, 'quantity'>): Promise<ServiceResponse> => {
        try {
            const product = await Product.findById(itemData.productId).lean();
            if (!product) {
                return { success: false, message: 'Produto não encontrado.', statusCode: 404 };
            }
            const colorVariant = product.colorVariants.find(i => i.color === itemData.color);
            if (!colorVariant) {
                return { success: false, message: 'Cor não disponível para este produto.', statusCode: 404 };
            }
            const sizeVariant = colorVariant.sizes.find(i => i.size === itemData.size);
            if (!sizeVariant) {
                return { success: false, message: 'Tamanho não disponível para esta cor.', statusCode: 404 };
            }
            // Busca o carrinho 
            const cart = await Cart.findOne({ userId });
            // Caminho 1 -> O carrinho já existe, verifica se o item já está nele
            if (cart) {
                const itemInCart = cart.items.find(item =>
                    item.productId.toString() === itemData.productId.toString() &&
                    item.color === itemData.color &&
                    item.size === itemData.size
                );

                if (!itemInCart) {
                    return { success: false, message: 'Item não encontrado no carrinho.', statusCode: 404 };
                }

                if (itemInCart.quantity > 1) {
                    itemInCart.quantity -= 1
                } else {
                    // Se a quantidade for 1, remove o item
                    return CartService.removeItem(userId, itemData);
                }

                const updatedCart = await cart.save();
                return { success: true, message: 'Item decrementado.', statusCode: 200, data: updatedCart };
            }

            return { success: false, message: 'Carrinho não encontrado.', statusCode: 404}
        } catch (error) {
            console.error('Erro ao decrementar item:', error)
            return { success: false, message: 'Erro interno ao decrementar item.', statusCode: 500 };
        }
    }

}

export default CartService;