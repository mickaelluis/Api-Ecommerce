import { string } from 'zod/v4';
import User from '../models/user.model';
require('dotenv').config();
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_TOKEN
//import isAutheticated from '../middlewares/isAuthenticated';


const AuthService = {
    register: async (body: { name: string; email: string; password: string }) => {
        if ( await User.findOne({ email: body.email })) { // Verifica se o email já está cadastrado
            return { status: 400, message: 'Email já cadastrado' };
        } else { // Se o email não estiver cadastrado, cria um novo usuário
            const user = new User({
                name: body.name,
                email: body.email,
                password: body.password
            })  
            return user.save()
                .then((user) => {
                    return { status: 201, data: user }; 
                })
                .catch((error) => { // Trata erros de validação ou outros erros do Mongoose
                    if (error.name === 'ValidationError') {
                        return { status: 400, message: error.message };
                    } else {
                        return { status: 500, message: 'Erro interno do servidor.' };
                    }
                });
        }   
 }}

export default AuthService;