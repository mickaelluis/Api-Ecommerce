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
            // Usa ! para afirmar que req.user existe, o middleware isAuthenticated faz essa verificação
            const userId = req.user!.id; // Pega o ID do usuário logado

            // Chama o serviço para buscar os dados
            const cart = await CartService.getCartByUserId(userId);

            // Retorna o carrinho encontrado ou um objeto de carrinho vazio se for null
            res.status(200).json(cart || { userId, items: [] });
            return;
        } catch (error) {
            console.error("Erro no controller ao buscar carrinho:", error);
            res.status(500).json({ message: "Erro interno no servidor." });
            return;
        }
    },

    upsertItem: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user!.id;
            // Validação básica do corpo da requisição (input)
            const { productId, color, size, quantity } = req.body;
            if (!productId || !color || !size || typeof quantity !== 'number' || !mongoose.Types.ObjectId.isValid(productId)) {
                res.status(400).json({ message: "Dados do item inválidos ou incompletos." });
                return;
            }

            const result = await CartService.upsertItem(userId, { productId, color, size, quantity });

            res.status(result.statusCode).json(result)
        } catch (error) {
            console.error("Erro no controller ao atualizar item no carrinho:", error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    },

    removeItem: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user!.id

            const { productId, color, size } = req.body;
            if (!productId || !color || !size) {
                res.status(400).json({ message: "Dados do item para remoção incompletos." });
                return;
            }

            const result = await CartService.removeItem(userId, { productId, color, size });

            res.status(result.statusCode).json(result);
        } catch (error) {
            console.error("Erro ao remover item do carrinho:", error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    }
}