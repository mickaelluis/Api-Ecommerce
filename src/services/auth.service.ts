import User from "../models/user.model";
require("dotenv").config();
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_TOKEN;
import { IUser } from "../models/user.model";
import clientes, { IClients } from "../models/Clientes.model";
import { Message } from "twilio/lib/twiml/MessagingResponse";

const AuthService = {
  register: async (body: { name: string; email: string; password: string }) => {
    try {
      // Validação simples dos dados de entrada
      const existingUser = await User.findOne({ email: body.email });
      if (existingUser) {
        return {
          status: 400,
          message: "Usuário já existe.",
        };
      }
      const { name, email, password } = body;
      const user = new User({ name, email, password });
      await user.save();
      const tokenPayload = { id: user.id, email: user.email, role: user.role };
      const Token = await jwt.sign(tokenPayload, secret, {
        expiresIn: '1d'
      });
      //console.log(user)
      const novoCliente = await clientes.create({ userid: user.id });
      console.log(novoCliente.errors);

      if (novoCliente.errors) {
        console.log("An error occurred while creating the client");
        await user.deleteOne({ _id: user.id });
        return {
          status: 401,
          message: "Server error",
        };
      }

      if (!novoCliente) {
        console.log("An error occurred while creating the client");
        await user.deleteOne({ _id: user.id });
        return {
          status: 401,
          message: "Server error",
        };
      }
      // Gera um token JWT para o usuário registrado
      return {
        status: 201,
        data: { Token: Token },
      };
    } catch (error) {
      const { email } = body;
      const userToDelete = await User.findOne({ email: email });
      if (userToDelete) {
        await userToDelete.deleteOne({ email: email });
        console.log("Usuário órfão deletado com sucesso.");
      }
      console.error("Error registering user:", error);
      // Retorna um erro genérico em caso de falha
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
          Authorization: `Bearer ${token}`,
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
