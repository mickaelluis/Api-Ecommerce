import User from '../models/user.model';
require('dotenv').config();
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_TOKEN
import { IUser } from '../models/user.model';


const AuthService = {
    register: async (body: { name: string; email: string; password: string }) => {
       try {
            // Validação simples dos dados de entrada
            const existingUser= await User.findOne({ email: body.email });
            if (existingUser) { 
                return {
                    status: 400,
                    message: 'Usuário já existe.',
                };
            }
            const { name, email, password } = body;
            const user = new User({ name, email, password });
            const Token = await jwt.sign( {body: email}, secret, { expiresIn: '1d' });
            await user.save();
            // Gera um token JWT para o usuário registrado
            return {
                status: 201,
                data: { 'Token': Token },
            }; 
            
        } catch (error) {
            console.error('Error registering user:', error); 
            // Retorna um erro genérico em caso de falha
            return {
                status: 500,
                message: 'Internal server error.',
            };
        } 
    },

    login: async (body: {  email: string; password: string }) => {
        try {
            const user = await User.findOne({ email: body.email}) as IUser | null;
            const token = await jwt.sign( { email: body.email}, secret, { expiresIn: '1d' });
            if (user && await user.comparePassword(body.password)){ //valida se a senha e o mail sao validos 
                return { // devolve o token no padrão Auth Type
                    status: 200,
                    Authorization: `Bearer ${token}` 
                }
            }else {// Retorna um erro em caso de senha ou email incorreto                 
                    return {
                        status: 401,
                        message: 'E-mail ou senha incorretos.',
                     }
                }
         } catch (error) {
             console.error('Error registering user:', error); 
            // Retorna um erro genérico em caso de falha
            return {
                status: 500,
                message: 'Internal server error.',
            };
        }
        
    }
} 

export default AuthService; 