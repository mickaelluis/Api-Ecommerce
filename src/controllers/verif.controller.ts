import { any } from 'zod';
import vericacao from '../services/verif.service'
import { Request, Response } from "express";

const verificacaoController = {
        INVerificacaoTelefoneTWILIO: async ( req: Request, res:Response) => {
             const {  clienteId } = req.body;
              try {
             const resultado = await vericacao.iniciarVerificacaoTelefoneTWILIO(clienteId);
             res.status(200).json(resultado);
             } catch (error: any) {
                res.status(400).json({ message: error.message });
            }
        },
    
        CONVerificacaoTelefoneTWILIO: async ( req: Request, res:Response) => {
            const { clienteId,telefone, codigo } = req.body;
            try { 
    
                const resultado = await vericacao.confirmarCodigoTelefoneTWILIO(clienteId, telefone, codigo);
    
                if(resultado && resultado.success) {
                    res.status(200).json(resultado);
             } else {
                    res.status(400).json(resultado);
             }
             } catch (error) {
            res.status(500).json({ message: 'Erro interno do servidor.' });
         }
        },
} 

export default verificacaoController