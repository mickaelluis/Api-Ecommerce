import Product from "../models/product.model";
import mongoose from "mongoose";

const StockService = {
    finalizePurchase: async ( // Finaliza a compra -> Apaga stock.reserved do DB.
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
                            color: color,
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

    restock: async ( // Coloca estoque diretamente -> stock.available.
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
                            color: color,
                            "sizes": { $elemMatch: { size: size } }
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

    reserveStock: async ( // Reserva estoque do stock.available -> decrementa stock.available e incrementa stock.reserved.
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
                            color: color,
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
    },

    releasedReservedStock: async ( // Se a compra não for finalizada ou cancelada, volta stock.reserved para stock.available, fazendo o contrário da função reserve.
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
                            color: color,
                            "sizes": { $elemMatch: { size: size, "stock.reserved": { $gte: quantity } } }
                        }
                    }
                },
                { // Incrementa o estoque DISPONÍVEL e a versão do documento.
                    $inc: {
                        __v: 1,
                        "colorVariants.$[cv].sizes.$[sz].stock.available": quantity,
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

            if (updateResult.modifiedCount === 0) {
                return { success: false, message: 'Estoque reservado indisponível.' };
            }

            return { success: true, message: 'Estoque ajustado com sucesso.' };
        } catch (error) {
            console.error('Erro ao reverter reserva de estoque:', { error, productId, quantity });
            return { success: false, message: 'Erro interno ao reverter reserva de estoque.' };
        }
    },

}

export default StockService;