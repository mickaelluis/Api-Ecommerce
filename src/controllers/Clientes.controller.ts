import clientService from "../services/clientes.service";
import { Request, Response } from "express";
// Controlador para gerenciar clientes
const clienteController = {
  deletarCliente: async (req: Request, res: Response) => {
    try {
      const { ClienteId, userId } = req.body;
      const resultado = await clientService.deletarCliente(ClienteId, userId);
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 400) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 200) {
        res.status(resultado.status).json(resultado.message);
      }
    } catch (error) {}
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

  deletarCPF: async (req: Request, res: Response) => {
    try {
      const { clienteId } = req.body;

      const resultado = await clientService.deleteClienteCpf(clienteId);

      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }

      if (resultado.status == 200) {
        res.status(resultado.status).json(resultado.message);
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao adicionar Numero." });
    }
  },

  adiconandoNumero: async (req: Request, res: Response) => {
    try {
      const { clienteId, novoNUMBER } = req.body;

      const Pais = "BR";

      const resultado = await clientService.updateClientNumber(
        clienteId,
        novoNUMBER,
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
      res.status(500).json({ message: "Erro ao adicionar Numero." });
    }
  },
  atualizarNumero: async (req: Request, res: Response) => {
    try {
      const { clienteId, numberNew } = req.body;

      const Pais = "BR";

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
      res.status(500).json({ message: "Erro ao adicionar Numero." });
    }
  },
  deletarNumero: async (req: Request, res: Response) => {
    try {
      const { clienteId, numberNew } = req.body;

      const resultado = await clientService.deliteCilenteNumber(clienteId);

      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }

      if (resultado.status == 201) {
        res.status(resultado.status).json(resultado.message);
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao adicionar Numero." });
    }
  },

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
      console.error(error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  },

  getLocalizacao: async (req: Request, res: Response) => {
    const { clienteId } = req.body;
    try {
      const resultado = await clientService.getclientLocalizacao(clienteId);
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 201) {
        res.status(resultado.status).json(resultado.data);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  },

  atulizarLocalizacao: async (req: Request, res: Response) => {
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
    try {
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
      console.error(error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  },

  deleteLocalizacao: async (req: Request, res: Response) => {
    const { clienteId, localizacaoId } = req.body;
    try {
      const resultado = await clientService.deleteClienteLocalzizacao(
        clienteId,
        localizacaoId
      );
      if (resultado.status === 404) {
        res.status(resultado.status).json(resultado.message);
      }
      if (resultado.status === 201) {
        res.status(resultado.status).json(resultado.data);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  },

  favoritos: async (req: Request, res: Response) => {
    const { clienteId, produtoID } = req.body;
    try {
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
      console.error(error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  },

  GetFavoritos: async (req: Request, res: Response) => {
    const { ClienteId } = req.body;
    try {
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
      console.error(error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  },

  DeleteFavoritos: async (req: Request, res: Response) => {
    const { clienteId, produtoID } = req.body;
    try {
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
      console.error(error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  },
};

export default clienteController;
