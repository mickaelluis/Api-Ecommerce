import clientService from "../services/clientes.service";
import { Request, Response } from "express";
// Controlador para gerenciar clientes
const clienteController = {
  getClientes: async(req: Request, res: Response) => {
     try {
       const resultado = await clientService.getCliente()
      if(resultado.status == 400) {
        res.status(resultado.status).json(resultado.message);
      }
      if(resultado.status == 201){
        res.status(resultado.status).json(resultado.data);
      }
     } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao deletar cliente:", error);
      res.status(500).json({ message: "Erro ao deletar cliente." });
     }
  },
  // Função deletar os dados de um cliente
  deletarCliente: async (req: Request, res: Response) => {
    try {
      // O serviço deve retornar um objeto com status e mensagem
      const { ClienteId, userId } = req.body;
      // Chama o serviço para deletar o cliente
      // O serviço deve retornar um objeto com status e mensagem
      const resultado = await clientService.deletarCliente(ClienteId, userId);
      // Verifica o status retornado pelo serviço e envia a resposta apropriada
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 400) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 200) {
        res.status(resultado.status).json(resultado.message);
      }
    } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao deletar cliente:", error);
      res.status(500).json({ message: "Erro ao deletar cliente." });
    }
  },
  // Função para adicionar CPF a um cliente
  // A função recebe o ID do cliente e o novo CPF
  adiconandoCPF: async (req: Request, res: Response) => {
    try {
      // Extrai o ID do cliente e o novo CPF do corpo da requisição
      const { clienteId, novoCPF } = req.body;
      // Verifica se o ID do cliente e o novo CPF foram fornecidos
      const resultado = await clientService.updateClientCpf(clienteId, novoCPF);
      // Retorna o cliente atualizado com o novo CPF
      if (resultado.status === 400) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 409) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status == 201) {
        res.status(resultado.status).json(resultado.data);
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao adicionar CPF." });
    }
  },

  // Função para deletar o CPF de um cliente
  // A função recebe o ID do cliente
  deletarCPF: async (req: Request, res: Response) => {
    try {
      // Extrai o ID do cliente do corpo da requisição
      const { clienteId } = req.body;
      // Chama o serviço para deletar o CPF do cliente
      // O serviço deve retornar um objeto com status e mensagem
      const resultado = await clientService.deleteClienteCpf(clienteId);
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status == 200) {
        res.status(resultado.status).json(resultado.message);
      }
    } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao deletar CPF:", error);
      res.status(500).json({ message: "Erro ao adicionar Numero." });
    }
  },

  // Função para adicionar ou atualizar o número de telefone de um cliente
  // A função recebe o ID do cliente e o novo número
  adiconandoNumero: async (req: Request, res: Response) => {
    try {
      // Extrai o ID do cliente e o novo número do corpo da requisição
      const { clienteId, novoNUMBER } = req.body;
      const Pais = "BR";
      // Chama o serviço para adicionar ou atualizar o número do cliente
      const resultado = await clientService.updateClientNumber(
        clienteId,
        novoNUMBER,
        Pais
      );
      // Retorna o cliente atualizado com o novo número
      // O serviço deve retornar um objeto com status e mensagem
      if (resultado.status === 400) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status == 201) {
        res.status(resultado.status).json(resultado.data);
      }
    } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao adicionar numero:", error);
      res.status(500).json({ message: "Erro ao adicionar Numero." });
    }
  },

  // Função para atualizar o número de telefone de um cliente
  // A função recebe o ID do cliente e o novo número
  atualizarNumero: async (req: Request, res: Response) => {
    try {
      // Extrai o ID do cliente e o novo número do corpo da requisição
      const { clienteId, numberNew } = req.body;
      const Pais = "BR";
      // Chama o serviço para atualizar o número do cliente
      // O serviço deve retornar um objeto com status e mensagem
      const resultado = await clientService.atualizarCienteNumber(
        clienteId,
        numberNew,
        Pais
      );
      if (resultado.status === 400) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status == 201) {
        res.status(resultado.status).json(resultado.data);
      }
    } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao atualizar numero:", error);
      res.status(500).json({ message: "Erro ao adicionar Numero." });
    }
  },

  // Função para deletar o número de telefone de um cliente
  // A função recebe o ID do cliente
  deletarNumero: async (req: Request, res: Response) => {
    try {
      // Verifica se o ID do cliente foi fornecido
      const { clienteId } = req.body;
      // Chama o serviço para deletar o número do cliente
      // O serviço deve retornar um objeto com status e mensagem
      const resultado = await clientService.deliteCilenteNumber(clienteId);
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status == 201) {
        res.status(resultado.status).json(resultado.message);
      }
    } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao deletar numero:", error);
      res.status(500).json({ message: "Erro ao adicionar Numero." });
    }
  },

  // Função para atualizar a localização de um cliente
  // A função recebe o ID do cliente e os novos dados de localização
  localizacao: async (req: Request, res: Response) => {
    const {
      clienteId,
      cep,
      logradouro,
      complemento,
      unidade,
      bairro,
      localidade,
      estado,
      regiao,
    } = req.body;
    try {
      // Chama o serviço para atualizar a localização do cliente
      // O serviço deve retornar um objeto com status e mensagem
      const resultado = await clientService.updateClientLocalizacao(
        clienteId,
        cep,
        logradouro,
        complemento,
        unidade,
        bairro,
        localidade,
        estado,
        regiao
      );
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 400) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 201) {
        res.status(resultado.status).json(resultado.data);
      }
    } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao atualizar localização:", error);
      res.status(500).json({ message: "Erro ao atualizar localização." });
    }
  },

  // Função para obter a localização de um cliente
  // A função recebe o ID do cliente e retorna os dados de localização
  getLocalizacao: async (req: Request, res: Response) => {
    try {
      // extrai o ID do cliente do corpo da requisição
      const { clienteId } = req.body;
      // Chama o serviço para obter a localização do cliente
      // O serviço deve retornar um objeto com status e mensagem
      const resultado = await clientService.getclientLocalizacao(clienteId);
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 201) {
        res.status(resultado.status).json(resultado.data);
      }
    } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao obter localização:", error);
      res.status(500).json({ message: "Erro ao obter localização." });
    }
  },

  // Função para atualizar a localização de um cliente
  // A função recebe o ID do cliente, o ID da localização e os novos dados de localização
  atulizarLocalizacao: async (req: Request, res: Response) => {
    try {
      //extrai os dados do corpo da requisição
      const {
        clienteId,
        localizacaoId,
        cep,
        logradouro,
        complemento,
        unidade,
        bairro,
        localidade,
        estado,
      } = req.body;
      // Chama o serviço para atualizar a localização do cliente
      // O serviço deve retornar um objeto com status e mensagem
      const resultado = await clientService.atualizarClienteLocalzizacao(
        clienteId,
        localizacaoId,
        cep,
        logradouro,
        complemento,
        unidade,
        bairro,
        localidade,
        estado
      );
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 201) {
        res.status(resultado.status).json(resultado.data);
      }
    } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao atualizar localização:", error);
      res.status(500).json({ message: "Erro ao atualizar localização." });
    }
  },

  // Função para deletar a localização de um cliente
  // A função recebe o ID do cliente e o ID da localização
  deleteLocalizacao: async (req: Request, res: Response) => {
    try {
      // Extrai o ID do cliente e o ID da localização do corpo da requisição
      const { clienteId, localizacaoId } = req.body;
      // Chama o serviço para deletar a localização do cliente
      // O serviço deve retornar um objeto com status e mensagem
      const resultado = await clientService.deleteClienteLocalzizacao(
        clienteId,
        localizacaoId
      );
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 201) {
        res.status(resultado.status).json(resultado.message);
      }
    } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao deletar localização:", error);
      res.status(500).json({ message: "Erro ao deletar localização." });
    }
  },

  // Função para adicionar ou atualizar favoritos de um cliente
  // A função recebe o ID do cliente e o ID do produto favorito
  favoritos: async (req: Request, res: Response) => {
    try {
      // Extrai o ID do cliente e o ID do produto do corpo da requisição
      const { clienteId, produtoID } = req.body;
      // Chama o serviço para adicionar ou atualizar os favoritos do cliente
      // O serviço deve retornar um objeto com status e mensagem
      const resultado = await clientService.UpdateClientFavoritos(
        clienteId,
        produtoID
      );
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 409) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 400) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 201) {
        res.status(resultado.status).json(resultado.data);
      }
    } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao adicionar favoritos:", error);
      res.status(500).json({ message: "Erro ao adicionar favoritos." });
    }
  },

  // Função para obter os favoritos de um cliente
  // A função recebe o ID do cliente e retorna os produtos favoritos
  GetFavoritos: async (req: Request, res: Response) => {
    try {
      // Verifica se o ID do cliente foi fornecido
      const { ClienteId } = req.body;
      // Chama o serviço para obter os favoritos do cliente
      // O serviço deve retornar um objeto com status e mensagem
      const resultado = await clientService.GetClienteFavoritos(ClienteId);
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 201) {
        res.status(resultado.status).json(resultado.data);
      }
      if (resultado.status === 200) {
        res.status(resultado.status).json(resultado.message);
      }
    } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao obter favoritos:", error);
      res.status(500).json({ message: "Erro ao obter favoritos." });
    }
  },

  DeleteFavoritos: async (req: Request, res: Response) => {
    try {
      // Verifica se o ID do cliente e o ID do produto foram fornecidos
      const { clienteId, produtoID } = req.body;
      // Chama o serviço para deletar os favoritos do cliente
      // O serviço deve retornar um objeto com status e mensagem
      const resultado = await clientService.DeleteClienteFavoritos(
        clienteId,
        produtoID
      );
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 200) {
        res.status(resultado.status).json(resultado.message);
      }
    } catch (error) {
      // Se ocorrer um erro, retorna uma resposta de erro genérica
      console.error("Erro ao deletar favoritos:", error);
      res.status(500).json({ message: "Erro ao deletar favoritos." });
    }
  },
};

export default clienteController;
