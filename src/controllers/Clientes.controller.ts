import clientService from '../services/clientes.service'
import { Request, Response } from "express";
// Controlador para gerenciar clientes
const clienteController = { 
    // Função para adicionar CPF a um cliente
    // A função recebe o ID do cliente e o novo CPF
    adiconandoCPF: async (req: Request, res: Response) => {
       try {
        // Extrai o ID do cliente e o novo CPF do corpo da requisição
        const { clienteId, novoCPF } = req.body;
        // Verifica se o ID do cliente e o novo CPF foram fornecidos
        const clienteAtualizado = await clientService.updateClientCpf(clienteId, novoCPF);
        // Retorna o cliente atualizado com o novo CPF
        res.status(200).json(clienteAtualizado); 
       } catch (error) {
         res.status(500).json({ message: "Erro ao adicionar CPF." });
       }
    },

    adiconandoNumero: async ( req: Request, res: Response) => {
        try {

            const { clienteId, novoNUMBER } = req.body;

            const Pais = 'BR'

            const clienteAtualizado = await clientService.updateClientNumber(clienteId, novoNUMBER, Pais)

            res.status(200).json(clienteAtualizado);
        } catch (error) {
            res.status(500).json({ message: "Erro ao adicionar Numero." });
        }
    },

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

    localizacao: async ( req: Request, res:Response) => {
        const { clienteId, cep, logradouro, complemento, unidade, bairro, localidade, estado, regiao} = req.body;
        try {
            const resultado = await clientService.updateClientLocalizacao(clienteId, cep, logradouro, 
             complemento, unidade, bairro, localidade, estado, regiao  );
             res.status(200).json(resultado);
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    },

    getLocalizacao: async (req: Request, res: Response ) => {
        const {clienteId} = req.body;
        try {
            const resultado = await clientService.getclientLocalizacao(clienteId);
            res.status(200).json(resultado);
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    },

    deleteLocalizacao: async (req: Request, res: Response) => {
        const { clienteId, cep, logradouro, complemento, unidade, bairro, localidade, estado} = req.body;
        try {
            const resultado = await clientService.deleteClienteLocalzizacao(clienteId, cep, logradouro, complemento, unidade, bairro, localidade, estado)
            res.status(200).json(resultado)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    },

    favoritos: async(req: Request, res:Response) => {
        const {clienteId, produtoID} = req.body
        try {
             const resultado = await clientService.UpdateClientFavoritos(clienteId, produtoID)
                res.status(200).json(resultado);
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    }
}

 
export default clienteController;  