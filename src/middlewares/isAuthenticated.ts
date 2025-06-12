import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
require('dotenv').config();


export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const secret = process.env.JWT_TOKEN || 'seuSegredo'; 
    if (!authHeader || !authHeader.startsWith('Bearer ')) { // verifica se o token existe 
        res.status(401).json({ message: 'Token não fornecido.' });
        return
    }

    const token = authHeader.split(' ')[1]; //pega o valor do cabeçalho Authorization, separa a string pelo espaço e extrai apenas o token JWT.

    try {
        const decoded = jwt.verify(token, secret); // verifica se o token coincide com o JWT TOKEN
        // Você pode adicionar o usuário decodificado ao req se quiser
        //(req as any).user = decoded;
        next(); // isso da continuidade na rota 
    } catch (error) {
      console.error('Error registering user:', error) // caso acontece algum erro sera exibido no console pra ser tratado
      res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
}