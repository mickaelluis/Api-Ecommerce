import { Request, Response } from "express";
import payment from "../services/payment.service";

const mercadopago = require("mercadopago");


const PaymentController = {
  postPagamento: async (req: Request, res: Response) => {
    try {
      const products = await payment.MercadoPago(req.body); // Chama o serviço para buscar todos os produtos
      res.status(200).json(products); // Retorna a lista de produtos com status 200
} catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      const errorMessage = error.cause?.[0]?.description || "Erro desconhecido";
      return res.status(400).json({ message: errorMessage });
    }
    }  
}

export default PaymentController