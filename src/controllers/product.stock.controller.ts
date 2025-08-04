import { Request, Response } from "express";
import StockService from "../services/product.stock.service";

export const StockController = {
    finalizePurchase: async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId, color, size, quantity } = req.body

            if (!productId || !color || !size || !quantity) {
                res.status(400).json({ message: 'Todos os campos são obrigatórios: productId, color, size, quantity.' });
                return;
            }

            const result = await StockService.finalizePurchase(productId, color, size, quantity);

            if (!result.success) { // Falha de negócio
                res.status(409).json({ message: result.message });
                return;
            }

            res.status(200).json(result);
            return;
        } catch (error) {
            console.error("Erro ao decrementar estoque:", error);
            res.status(500).json({ message: 'Ocorreu um erro interno ao decrementar estoque.' });
            return;
        }
    },

    restock: async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId, color, size, quantity } = req.body

            if (!productId || !color || !size || !quantity) {
                res.status(400).json({ message: 'Todos os campos são obrigatórios: productId, color, size, quantity.' });
                return;
            }

            const result = await StockService.restock(productId, color, size, quantity);

            if (!result.success) { // Falha de negócio
                res.status(409).json({ message: result.message });
                return;
            }

            res.status(200).json(result);
            return;
        } catch (error) {
            console.error("Erro ao adiconar estoque:", error);
            res.status(500).json({ message: 'Ocorreu um erro interno ao adicionar estoque.' });
            return;
        }
    },

    reserveStock: async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId, color, size, quantity } = req.body

            if (!productId || !color || !size || !quantity) {
                res.status(400).json({ message: 'Todos os campos são obrigatórios: productId, color, size, quantity.' });
                return;
            }

            const result = await StockService.reserveStock(productId, color, size, quantity);

            if (!result.success) { // Falha de negócio
                res.status(409).json({ message: result.message });
                return;
            }

            res.status(200).json(result);
            return;
        } catch (error) {
            console.error("Erro ao reservar estoque:", error);
            res.status(500).json({ message: 'Ocorreu um erro interno ao reservar estoque.' });
            return;
        }
    },

    releaseReservedStock: async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId, color, size, quantity } = req.body

            if (!productId || !color || !size || !quantity) {
                res.status(400).json({ message: 'Todos os campos são obrigatórios: productId, color, size, quantity.' });
                return;
            }

            const result = await StockService.releaseReservedStock(productId, color, size, quantity);

            if (!result.success) { // Falha de negócio
                res.status(409).json({ message: result.message });
                return;
            }

            res.status(200).json(result);
            return;
        } catch (error) {
            console.error("Erro ao reverter reserva de estoque:", error);
            res.status(500).json({ message: 'Ocorreu um erro interno ao reverter reserva de estoque.' });
            return;
        }
    },

}