import { Request, Response } from "express";
import ProductService from "../services/product.service"; // Importa a camada de serviço

export const ProductController = {
    // Busca todos os produtos cadastrados
    getAllProducts: async (req: Request, res: Response): Promise<void> => {
        try {
            const products = await ProductService.getAllProducts(); // Chama o serviço para buscar todos os produtos
            res.status(200).json(products); // Retorna a lista de produtos com status 200
            return; // Encerra a execução da função
        } catch (error) {
            console.error('Erro ao buscar produtos:', error); // Log de erro para debug
            res.status(500).json({ message: 'Ocorreu um erro interno ao buscar produtos.' }); // Retorna erro 500
            return;
        }
    },

    // Busca um produto pelo ID fornecido na URL
    getProductById: async (req: Request, res: Response): Promise<void> => {
        try {
            const productId = req.params.id; // Pega o ID da URL
            const product = await ProductService.getProductById(productId); // Busca o produto pelo ID

            if (product) {
                res.status(200).json(product); // Produto encontrado
                return;
            } else {
                res.status(404).json({ message: 'Produto não encontrado.' }); // Produto não existe
                return;
            }
        } catch (error: any) {
            if (error.name === 'CastError') {
                res.status(400).json({ message: 'ID de produto inválido.' }); 
                return;
            } else {
                console.error("Erro ao buscar produto por ID:", error);
                res.status(500).json({ message: 'Ocorreu um erro interno ao buscar o produto.' }); 
                return;
            }
        }
    },

    // Cria um novo produto
    createProduct: async (req: Request, res: Response): Promise<void> => {
        try {
            const newProduct = await ProductService.createProduct(req.body); // Usa o corpo da requisição para criar o produto
            res.status(201).json(newProduct); // Produto criado com sucesso (201 Created)
            return;
        } catch (error: any) {
            // Dados inválidos (ex: campos obrigatórios ausentes)
            if (error.name === 'ValidationError') {
                res.status(400).json({ message: 'Dados inválidos para criação do produto.' });
                return;
            } else {
                console.error("Erro ao criar produto:", error);
                res.status(500).json({ message: 'Ocorreu um erro interno ao criar o produto.' });
                return;
            }
        }
    },

    // Atualiza um produto existente
    updateProduct: async (req: Request, res: Response): Promise<void> => {
        try {
            const updateProduct = await ProductService.updateProduct(req.params.id, req.body); // Envia ID e novos dados
            if (updateProduct) {
                res.status(200).json(updateProduct); // Retorna o produto atualizado
                return;
            } else {
                res.status(404).json({ message: 'Produto não encontrado para atualizar.' }); // ID não encontrado
                return;
            }
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                res.status(400).json({ message: 'Dados de atualização inválidos.' }); // Dados não passaram na validação
                return;
            } else if (error.name === 'CastError') {
                res.status(400).json({ message: 'ID de produto inválido.' });
                return;
            } else {
                console.error("Erro ao atualizar produto:", error);
                res.status(500).json({ message: 'Ocorreu um erro interno ao atualizar o produto.' }); 
                return;
            }
        }
    },

    // Deleta um produto pelo ID
    deleteProduct: async (req: Request, res: Response): Promise<void> => {
        try {
            const deleteProduct = await ProductService.deleteProduct(req.params.id); // Envia ID para deletar
            if (deleteProduct) {
                res.status(200).json({ message: 'Produlo deletado com sucesso.' }); // Confirma a exclusão
                return;
            } else {
                res.status(404).json({ message: 'Produto não encontrado para ser deletado.' }); // Produto não existe
                return;
            }
        } catch (error: any) {
            if (error.name === 'CastError') {
                res.status(400).json({ message: 'ID de produto inválido.' }); 
                return;
            } else {
                console.error("Erro ao deletar produto:", error);
                res.status(500).json({ message: 'Ocorreu um erro interno ao deletar o produto.' }); 
                return;
            }
        }
    },

    // Pesquisa produtos com base em filtros opcionais (name, category, minPrice, maxPrice)
    searchProducts: async (req: Request, res: Response): Promise<void> => {
        try {
            const queryParams = {
                name: req.query.name as string | undefined,
                category: req.query.category as string | undefined,
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
            };
            const products = await ProductService.searchProducts(queryParams); // Pesquisa no banco com os filtros
            res.status(200).json(products); // Retorna os resultados encontrados
            return;
        } catch (error: any) {
            console.error("Erro ao pesquisar produto:", error.message);
            res.status(500).json({ message: 'Ocorreu um erro interno ao pesquisar produtos.' });
            return;
        }
    }
};