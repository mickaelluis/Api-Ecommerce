import { Request, Response } from "express";
import ProductService from "../services/product.service";

export const ProductController = {
    // Busca todos os produtos cadastrados e retorna em formato JSON
    getAllProducts: async (req: Request, res: Response): Promise<void> => {
        try {
            const products = await ProductService.getAllProducts(); // Busca todos os produtos no banco
            res.status(200).json(products); // Responde com status 200 e a lista de produtos
        } catch (error) {
            // Em caso de erro inesperado, loga e retorna erro 500
            console.error('Erro ao buscar produtos:', error);
            res.status(500).json({ message: 'Ocorreu um erro interno ao buscar produtos.' })
        }
    },

    // Busca um produto pelo ID fornecido na URL
    getProductById: async (req: Request, res: Response): Promise<void> => {
        try {
            const productId = req.params.id; // Extrai o id dos parâmetros da requisição
            const product = await ProductService.getProductById(productId); // Busca o produto pelo id

            if (product) {
                res.status(200).json(product); // Se encontrado, retorna o produto
            } else {
                res.status(404).json({ message: 'Produto não encontrado.' }); // Se não, retorna 404
            }
        } catch (error: any) {
            // Se o id for inválido (ex: formato errado), retorna erro 400
            if (error.name === 'CastError') {
                res.status(400).json({ message: 'ID de produto inválido.' });
            } else {
                // Outros erros inesperados
                console.error("Erro ao buscar produto por ID:", error);
                res.status(500).json({ message: 'Ocorreu um erro interno ao buscar o produto.' });
            }
        }
    },

    // Cria um novo produto com os dados enviados no corpo da requisição
    createProduct: async (req: Request, res: Response): Promise<void> => {
        try {
            const newProduct = await ProductService.createProduct(req.body); // Cria o produto
            res.status(201).json(newProduct); // Retorna o produto criado com status 201
        } catch (error: any) {
            // Se os dados enviados forem inválidos, retorna erro 400
            if (error.name === 'ValidationError') {
                res.status(400).json({ message: 'Dados inválidos para criação do produto.' });
            } else {
                // Outros erros inesperados
                console.error("Erro ao criar produto:", error);
                res.status(500).json({ message: 'Ocorreu um erro interno ao criar o produto.' });
            }
        }
    },

    // Atualiza um produto existente pelo ID
    updateProduct: async (req: Request, res: Response): Promise<void> => {
        try {
            const updateProduct = await ProductService.updateProduct(req.params.id, req.body)
            if (updateProduct) {
                res.status(200).json(updateProduct) // Retorna o produto atualizado
            } else {
                res.status(404).json({ message: 'Produto não encontrado para atualizar.' }) // Produto não existe
            }
        } catch (error: any) {
            // Dados inválidos para atualização
            if (error.name === 'ValidationError') {
                res.status(400).json({ message: 'Dados de atualização inválidos.' });
            } else if (error.name === 'CastError') {
                res.status(400).json({ message: 'ID de produto inválido.' });
            } else {
                // Outros erros inesperados
                console.error("Erro ao atualizar produto:", error);
                res.status(500).json({ message: 'Ocorreu um erro interno ao atualizar o produto.' });
            }
        }
    },

    // Remove um produto pelo ID
    deleteProduct: async (req: Request, res: Response): Promise<void> => {
        try {
            const deleteProduct = await ProductService.deleteProduct(req.params.id)
            if (deleteProduct) {
                res.status(200).json({ message: 'Produlo deletado com sucesso.' }); // Produto deletado
            } else {
                res.status(404).json({ message: 'Produto não encontrado para ser deletado.' }) // Produto não existe
            }
        } catch (error: any) {
            // ID inválido
            if (error.name === 'CastError') {
                res.status(400).json({ message: 'ID de produto inválido.' });
            } else {
                // Outros erros inesperados
                console.error("Erro ao deletar produto:", error);
                res.status(500).json({ message: 'Ocorreu um erro interno ao deletar o produto.' });
            }
        }
    }
}