import User, { IUser } from "../models/user.model";
require("dotenv").config();
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_TOKEN;
import clientes, { IClients } from "../models/Clientes.model";
import { runTransaction } from "../database/database";

const AuthService = {
  register: async (body: { name: string; email: string; password: string; sexo: string; }) => {
    try {
      // Validação simples dos dados de entrada
      const existingUser = await User.findOne({ email: body.email });
      if (existingUser) {
        return {
          status: 400,
          message: "Usuário já existe.",
        };
      };
      const resultado = runTransaction(async (session) =>{
        const { name, email, password, sexo} = body;
        const user = new User({ name, email, password, sexo});
        await user.save({ session });
        if(!user) {
           throw new Error("Erro ao criar o usuario");
        }
       const clinete = await clientes.create([{ userid: user.id }], { session })
        if(!clinete) {
           throw new Error("Erro ao criar o usuario");
        }
        const tokenPayload = { id: user._id, email: user.email, role: user.role };
        const Token = await jwt.sign(tokenPayload, secret, {
        expiresIn: '1d'
        });
        return { message: "Usuario criado com sucesso", data: Token}
      })
       return { status: 200, message: (await resultado).message, data: (await resultado).data } 
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: "Internal server error.",
      };
    }
  },

  login: async (body: { email: string; password: string }) => {
    try {
      const user = (await User.findOne({ email: body.email })) as IUser | null;

      if (user && (await user.comparePassword(body.password))) {
        const tokenPayload = { id: user.id, email: user.email, role: user.role };
        const token = await jwt.sign(tokenPayload, secret, { 
          expiresIn: '1d' 
        });
        //valida se a senha e o mail sao validos
        return {
          // devolve o token no padrão Auth Type
          status: 200,
          Authorization: `${token}`,
        };
      } else {
        // Retorna um erro em caso de senha ou email incorreto
        return {
          status: 401,
          message: "E-mail ou senha incorretos.",
        };
      }
    } catch (error) {
      console.error("Error registering user:", error);
      // Retorna um erro genérico em caso de falha
      return {
        status: 500,
        message: "Internal server error.",
      };
    }
  },
};

export default AuthService;
