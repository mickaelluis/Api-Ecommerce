import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
require('dotenv').config();


export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const secret = process.env.JWT_TOKEN || 'seuSegredo';
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Token não fornecido.' });
        return
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, secret);
        // Você pode adicionar o usuário decodificado ao req se quiser
        (req as any).user = decoded;
        next();
    } catch (error) {
      console.error('Error registering user:', error)
      res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
}