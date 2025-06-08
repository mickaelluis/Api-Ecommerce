import authService from './auth.service';
import { Request, Response } from 'express';


// Defina o controller como um objeto
const register = async ( req: any, res: any ) => {
   try { 
            const result = await authService.register(req.body); // Chama o serviço de autenticação para registrar o usuário
            if ('data' in result) { // Verifica se o resultado contém dados
                return res.status(result.status).json(result.data);
            } else { // Se não houver dados, retorna uma mensagem de erro
                return res.status(result.status).json({ message: result.message });
            }
        } catch (error) { // Trata erros inesperados
            return res.status(500).json({ message: 'Erro interno do servidor.' });
        }
};

const authController = {register} // Exporta o controller como um objeto com a função register
 
export default authController;   