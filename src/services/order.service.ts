import Order, { IOrder, IOrderItem } from "../models/order.model";
import Product from "../models/product.model"
import StockService from "./product.stock.service";

const OrderService = {
    rollbackReservations: async (itemsToRelease: Omit<IOrderItem, 'price'>[]): Promise<void> => { // Função auxiliar para fazer o rollback.
        if (itemsToRelease.length === 0) return;

        console.log(`Iniciando rollback para ${itemsToRelease.length} itens`);

        const rollbackPromises = itemsToRelease.map(item =>
            StockService.releaseReservedStock(
                item.productId.toString(),
                item.color,
                item.size,
                item.quantity
            ).catch(error => {
                console.error('FALHA CRÍTICA NO ROLLBACK!', { item, error })
            })
        );

        await Promise.all(rollbackPromises);
        console.log('Rollback concluído')
    },

    createOrder: async ( // Orquestra a crição de um pedido através do carrinho de compras
        userId: string,
        cartItems: Omit<IOrderItem, 'price'>[] // Item do carrinho aceito, porém é omitido o preço para pegar o preço atual do banco de dados.
    ): Promise<{ success: boolean; message: string; orderId?: string }> => {

        const successfullyReservedItems: Omit<IOrderItem, 'price'>[] = []; // Guarda os itens exatamente como eles vieram do carrinho. 

        try {
            const itemsForOrder: IOrderItem[] = []; // Guarda a versão final de cada item, incluindo o preço que nós buscamos do banco de dados de forma segura.
            let totalAmount = 0;

            for (const cartItem of cartItems) {
                const product = await Product.findOne(
                    {
                        _id: cartItem.productId,
                        "colorVariants": {
                            $elemMatch: {
                                "color": cartItem.color,
                                "sizes": { $elemMatch: { size: cartItem.size } }
                            }
                        }
                    },
                    { name: 1, "colorVariants.$": 1 }
                ).lean();

                if (!product || !product.colorVariants?.[0]?.sizes?.[0]) { // Verificação para ver se item existe.
                    await OrderService.rollbackReservations(successfullyReservedItems);
                    return { success: false, message: `Produto inválido: ${cartItem.productId} (${cartItem.color}/${cartItem.size}) não foi encontrado` };
                };

                const reservationResult = await StockService.reserveStock( // Reserva de estoque.
                    cartItem.productId.toString(), cartItem.color, cartItem.size, cartItem.quantity
                );

                if (!reservationResult.success) { // Verificação de estoque.
                    await OrderService.rollbackReservations(successfullyReservedItems);
                    return { success: false, message: reservationResult.message };
                }

                successfullyReservedItems.push(cartItem);
                const currentPrice = product.colorVariants[0].sizes[0].price;
                itemsForOrder.push({ ...cartItem, price: currentPrice}); // Clona cartItem e adiciona price que acabamos de buscar no banco de dados
                totalAmount += currentPrice * cartItem.quantity;
            }

            const newOrder = await Order.create({
                userId,
                items: itemsForOrder,
                totalAmount,
                status: 'PENDING_PAYMENT'
            });

            return { success: true, message: 'Pedido criado com sucesso.', orderId: newOrder._id.toString() }

        } catch (error) {
            console.error("Erro inesperado na criação do pedido, iniciando rollback.", error);
            await OrderService.rollbackReservations(successfullyReservedItems);
            return { success: false, message: 'Ocorreu um erro inesperado ao processar pedido.' };

        }

    },

};

export default OrderService;