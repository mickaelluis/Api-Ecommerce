import  clientes, { IClients } from '../models/Clientes.model';


const clientesService = {
    criarCliente: async (userID: any) => {
       const novoCliente = await clientes.create(userID);
        return novoCliente;
    }
}

export default clientesService;