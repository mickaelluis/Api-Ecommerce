import clientesService from '../services/clientes.service'

const clienteController = {

    criarCliente: async (req: Request, res: any) => {
         try {
             const clientes =  await clientesService.criarCliente(req.body as any);
             res.status(200).json(clientes);
    } catch (error: any ) {     
         console.error(error);
         res.status(500).json({ message: 'Erro ao criar cliente.' });
      }
    }
}

 
export default clienteController;  