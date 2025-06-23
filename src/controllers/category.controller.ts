import { Request, Response } from "express";
import CategoryService from "../services/category.service";

export const CategoryController = {
    // Busca todos as categorias cadastrados
    getAllCategories: async (req: Request, res: Response): Promise<void> => {
        try {
            const categories = await CategoryService.getAllCategories(); // Chama o serviço para buscar todos as categorias
            res.status(200).json(categories); // Retorna a lista de categorias com status 200
            return; // Encerra a execução da função
        } catch (error) {
            console.error('Erro ao buscar categorias:', error); // Log de erro para debug
            res.status(500).json({ message: 'Ocorreu um erro interno ao buscar categorias.' }); // Retorna erro 500
            return;
        }
    },

    // Busca uma categoria pelo ID fornecido na URL
    getCategoryById: async (req: Request, res: Response): Promise<void> => {
        try {
            const categoryId = req.params.id; // Pega o ID da URL
            const category = await CategoryService.getCategoryById(categoryId); // Busca a categoria pelo ID

            if (category) {
                res.status(200).json(category); // categoria encontrada
                return;
            } else {
                res.status(404).json({ message: 'categoria não encontrado.' }); // categoria não existe
                return;
            }
        } catch (error: any) {
            if (error.name === 'CastError') {
                res.status(400).json({ message: 'ID de categoria inválido.' });
                return;
            } else {
                console.error("Erro ao buscar categoria por ID:", error);
                res.status(500).json({ message: 'Ocorreu um erro interno ao buscar a categoria.' });
                return;
            }
        }
    },

    // Cria uma novo categoria
    createCategory: async (req: Request, res: Response): Promise<void> => {
        try {
            const newcategory = await CategoryService.createCategory(req.body); // Usa o corpo da requisição para criar a categoria
            res.status(201).json(newcategory); // categoria criada com sucesso (201 Created)
            return;
        } catch (error: any) {
            // Dados inválidos (ex: campos obrigatórios ausentes)
            if (error.name === 'ValidationError') {
                res.status(400).json({ message: 'Dados inválidos para criação a categoria.' });
                return;
            } else if ((error as any).code === 11000) { // Tratamento de erro de chave duplicada
                res.status(409).json({ message: 'Conflito: Já existe uma categoria com este nome.' }); // Mensagem específica para duplicidade de nome
                return;
            } else {
                console.error("Erro ao criar categoria:", error);
                res.status(500).json({ message: 'Ocorreu um erro interno ao criar a categoria.' });
                return;
            }
        }
    },

    // Atualiza uma categoria existente
    updateCategory: async (req: Request, res: Response): Promise<void> => {
        try {
            const updatecategory = await CategoryService.updateCategory(req.params.id, req.body); // Envia ID e novos dados
            if (updatecategory) {
                res.status(200).json(updatecategory); // Retorna a categoria atualizado
                return;
            } else {
                res.status(404).json({ message: 'categoria não encontrado para atualizar.' }); // ID não encontrado
                return;
            }
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                res.status(400).json({ message: 'Dados de atualização inválidos.' }); // Dados não passaram na validação
                return;
            } else if (error.name === 'CastError') {
                res.status(400).json({ message: 'ID de categoria inválido.' });
                return;
            } else {
                console.error("Erro ao atualizar categoria:", error);
                res.status(500).json({ message: 'Ocorreu um erro interno ao atualizar a categoria.' });
                return;
            }
        }
    },

    // Deleta um categoria pelo ID
    deleteCategory: async (req: Request, res: Response): Promise<void> => {
        try {
            const deletecategory = await CategoryService.deleteCategory(req.params.id); // Envia ID para deletar
            if (deletecategory) {
                res.status(200).json({ message: 'Categoria deletada com sucesso.' }); // Confirma a exclusão
                return;
            } else {
                res.status(404).json({ message: 'Categoria não encontrado para ser deletada.' }); // categoria não existe
                return;
            }
        } catch (error: any) {
            if (error.name === 'CastError') {
                res.status(400).json({ message: 'ID de categoria inválido.' });
                return;
            } else {
                console.error("Erro ao deletar categoria:", error);
                res.status(500).json({ message: 'Ocorreu um erro interno ao deletar a categoria.' });
                return;
            }
        }
    },
};