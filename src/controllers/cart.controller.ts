import { Request, Response } from "express";
import CartService from "../services/cart.service";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    }
}

export const CartController = {
    getCartByUserId: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id; // Pega o ID do usuário logado

            // Valida se o usuário está autenticado
            if (!userId) {
                res.status(401).json({ message: "Não autorizado." });
                return;
            }

            // Chama o serviço para buscar os dados
            const cart = await CartService.getCartByUserId(userId);

            // Retorna o carrinho encontrado ou um objeto de carrinho vazio se for null
            res.status(200).json(cart || { userId, items: [] });

        } catch (error) {
            console.error("Erro no controller ao buscar carrinho:", error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    },

    upsertItem: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;

            // Valida se o usuário está autenticado
            if (!userId) {
                res.status(401).json({ message: "Não autorizado." });
                return;
            }

            // Validação básica do corpo da requisição (input)
            const { productId, color, size, quantity } = req.body;
            if (!productId || !color || !size || typeof quantity !== 'number' || !mongoose.Types.ObjectId.isValid(productId)) {
                res.status(400).json({ message: "Dados do item inválidos ou incompletos." });
                return;
            }

            // Chama o serviço, que retorna um envelope de resposta.
            const result = await CartService.upsertItem(userId, req.body);

            // Traduz a resposta do serviço para uma resposta HTTP.
            if (result.success) {
                res.status(200).json(result);
            } else {
                // A falha aqui seria um erro interno, então retornamos 500.
                res.status(500).json(result);
            }

        } catch (error) {
            console.error("Erro no controller ao atualizar item no carrinho:", error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    },

    removeItem: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id
            if (!userId) {
                res.status(401).json({ message: "Não autorizado." });
                return;
            }

            const { productId, color, size } = req.body;
            if (!productId || !color || !size) {
                res.status(400).json({ message: "Dados do item para remoção incompletos." });
                return;
            }

            const result = await CartService.removeItem(userId, req.body);

            if (result.success) {
                res.status(200).json(result);
                return;
            } else {
                res.status(404).json({ message: 'Item não encontrado' })
            }
        } catch (error) {
            console.error("Erro ao remover item do carrinho:", error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    }
}