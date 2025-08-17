import { any } from 'zod';
import clientService from '../services/clientes.service'
import { Request, Response } from "express";

/*const verificacaoController = {
    INVerificacaoTelefone: async ( req: Request, res:Response) => {
             const {  clienteId } = req.body;
              try {
             const resultado = await clientService.iniciarVerificacaoTelefone(clienteId);
             res.status(200).json(resultado);
             } catch (error: any) {
                res.status(400).json({ message: error.message });
            }
        },
    
        CONVerificacaoTelefone: async ( req: Request, res:Response) => {
            const { clienteId,telefone, codigo } = req.body;
            try { 
    
                const resultado = await clientService.confirmarCodigoTelefone(clienteId, telefone, codigo);
    
                if(resultado && resultado.success) {
                    res.status(200).json(resultado);
             } else {
                    res.status(400).json(resultado);
             }
             } catch (error) {
            res.status(500).json({ message: 'Erro interno do servidor.' });
         }
        },
} */