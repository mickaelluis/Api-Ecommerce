import { ObjectId } from "mongoose";
import clientes, { IClients } from "../models/Clientes.model";
import User, { IUser } from "../models/user.model";
import { cpf } from "cpf-cnpj-validator";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import Product from "../models/product.model";
import { runTransaction } from "../database/database";
const axios = require("axios");

const clientService = {
  deletarCliente: async (ClienteId: ObjectId, userId: ObjectId) => {
    const session = clientes.startSession();
    try {
      const cliente = clientes.findById(ClienteId);
      if (!cliente) {
        return { status: 404, message: "cliente não encontrado!!" };
      }
      const resultado = runTransaction(async (session) => {
        const deleteUser = await User.findByIdAndDelete(
          { _id: userId },
          { session }
        );
        if (!deleteUser) {
          // Lançar um erro aqui fará a transação ser abortada (rollback)
          throw new Error("Cliente não encontrado para apagar.");
        }
        // Apaga o cliente
        const deleteResult = await clientes.findByIdAndDelete(
          { _id: ClienteId },
          { session }
        );
        if (!deleteResult) {
          // Lançar um erro aqui fará a transação ser abortada (rollback)
          throw new Error("Cliente não encontrado para apagar.");
        }
        return deleteResult;
      });
      if (!resultado) {
        return {
          status: 400,
          message:
            "Não foi possivel apagar seus dados, entre em contato com o Suporte!!!",
        };
      }
      return { status: 200, message: "Conta apagada com sucesso!!" };
    } catch (error) {
      console.error("Erro ao adicionar CPF:", error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },
  // A função agora recebe o ID do cliente e o novo CPF
  updateClientCpf: async (clienteId: ObjectId, novoCPF: string) => {
    try {
      // Remove todos os caracteres não numéricos do CPF
      const cpfLimpo = String(novoCPF).replace(/\D/g, "");
      // Verifica se o CPF é válido usando a biblioteca cpf-cnpj-validator
      const ehValido = cpf.isValid(cpfLimpo);
      // Se o CPF não for válido, retorna uma mensagem de erro
      if (!ehValido) {
        return { status: 400, message: `O CPF ${novoCPF} é INVÁLIDO.` };
      }
      // Filtro para buscar o CPF no banco de dados
      const filtroCPF = { CPF: cpfLimpo };
      // Verifica se já existe um cliente com o mesmo CPF
      const clienteEncontrado = await clientes.findOne(filtroCPF);
      // Se já existir, retorna uma mensagem de erro
      if (clienteEncontrado) {
        return { status: 409, message: `Não e  possivel cadastra esse cpf!!!` };
      }
      // 1. Critério de busca: Encontrar o cliente pelo seu _id
      const filtro = { _id: clienteId };
      // 2. Dados a serem atualizados.
      // Usamos o operador '$set' para garantir que apenas o campo CPF será alterado.
      const autenticacao = { $set: { CPF: cpfLimpo } };
      // Define as opções para a atualização
      const opcoes = { new: true };
      // 3. Opções: { new: true } faz com que ele retorne o documento DEPOIS da atualização.
      const clienteAtualizado = await clientes.findOneAndUpdate(
        filtro,
        autenticacao,
        opcoes
      );
      console.log(clienteAtualizado);
      // 4. Executar a busca e atualização
      if (!clienteAtualizado) {
        return { status: 404, message: `Cliente não foi encontrado.` };
      }
      return { status: 201, data: clienteAtualizado };
    } catch (error) {
      console.error("Erro ao adicionar CPF:", error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  deleteClienteCpf: async (clienteId: ObjectId) => {
    const session = clientes.startSession();
    try {
      const cliente = clientes.findById(clienteId);
      if (!cliente) {
        return { status: 404, message: "cliente não encontrado!!" };
      }
      const filtro = { _id: clienteId };
      const deleteCPF = {
        $unset: {
          CPF: "",
        },
      };
      const clienteAtualizado = await clientes.updateOne(filtro, deleteCPF);
      if (!clienteAtualizado) {
        return { status: 404, message: "cliente não tem nenhum CPF!!" };
      }
      return { status: 200, message: "CPF apagado com sucesso" };
    } catch (error) {
      console.error("Erro ao adicionar CPF:", error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  updateClientNumber: async (
    clienteId: ObjectId,
    novoNUMBER: string,
    Pais: CountryCode
  ) => {
    try {
      // Remove todos os caracteres não numéricos do número de telefone
      const telefone = parsePhoneNumberFromString(novoNUMBER, Pais);
      // Verifica se o número de telefone é válido
      if (!telefone || !telefone.isValid()) {
        return { status: 400, message: "Numero de telefone invalido!!!" };
      }
      // Formata o número para o padrão E.164
      const numeroEmFormatoInternacional = telefone.format("E.164");
      // 1. Critério de busca: Encontrar o cliente pelo seu _id
      const filtro = { userid: clienteId };
      // Usamos o operador '$set' para garantir que apenas o campo telefone será alterado.
      const autenticacao = {
        $set: {
          telefone: [{ Number: numeroEmFormatoInternacional, auth: "false" }],
        },
      };
      // Define as opções para a atualização, true faz com que ele retorne o documento DEPOIS da atualização.
      const opcoes = { new: true };
      // Atualiza o cliente com o novo número de telefone
      const clienteAtualizado = await clientes.findOneAndUpdate(
        filtro,
        autenticacao,
        opcoes
      );
      // Se o cliente não for encontrado, retorna uma mensagem de erro
      if (!clienteAtualizado) {
        return { status: 404, message: `Cliente não foi encontrado.` };
      }
      // Se a atualização for bem-sucedida, retorna o cliente atualizado
      return { status: 201, data: clienteAtualizado };
    } catch (error) {
      console.error("Erro ao adicionar NUMERO:", error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  atualizarCienteNumber: async (
    clienteId: ObjectId,
    numberNew: string,
    Pais: CountryCode
  ) => {
    try {
      const client = await clientes.findById(clienteId);
      if (!client) {
        return { status: 404, message: `Cleinte não foi encontrado.` };
      }
      const telefone = parsePhoneNumberFromString(numberNew, Pais);
      if (!telefone || !telefone.isValid()) {
        return { status: 400, message: "Numero de telefone invalido!!!" };
      }
      const numeroEmFormatoInternacional = telefone.format("E.164");
      const filtro = { _id: clienteId };
      const atualizacao = {
        $set: {
          telefone: { Number: numeroEmFormatoInternacional, auth: "false" },
        },
      };
      const numeroAtualizado = await clientes.findOneAndUpdate(
        filtro,
        atualizacao,
        { new: true }
      );
      if (!numeroAtualizado) {
        return {
          status: 404,
          Message: "nao foi possivel cadastra esse numero",
        };
      }
      return { status: 201, data: numeroAtualizado };
    } catch (error) {
      console.error("Erro ao adicionar NUMERO:", error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  deliteCilenteNumber: async (clienteId: ObjectId) => {
    try {
      const client = await clientes.findById(clienteId);
      if (!client) {
        return { status: 404, message: `Cleinte não foi encontrado.` };
      }
      const filtro = { _id: clienteId };
      const deleteNumber = {
        $set: {
          telefone: {},
        },
      };
      await clientes.updateOne(filtro, deleteNumber);
      return { status: 201, message: "Numero apagado" };
    } catch (error) {
      console.error("Erro ao adicionar NUMERO:", error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  updateClientLocalizacao: async (
    clienteId: ObjectId,
    cep: string,
    logradouro: string,
    complemento: string,
    unidade: string,
    bairro: string,
    localidade: string,
    estado: string,
    regiao: string
  ) => {
    try {
      const clienteExiste = await clientes.findById(clienteId);
      if (!clienteExiste) {
        return { status: 404, message: "Cliente não encontrado!" };
      }
      // Limpa caracteres não numéricos do CEP
      const cepLimpo = cep.replace(/\D/g, "");

      // Faz a requisição para a API pública ViaCEP
      const { data: resposta } = await axios.get(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      // Verifica se o CEP é válido
      if (resposta.erro) {
        return { status: 404, message: "CEP inválido!!." };
      }

      // Validação da localização
      if (
        resposta.localidade === localidade &&
        resposta.estado === estado && // ViaCEP usa 'uf' no lugar de 'estado'
        resposta.regiao === regiao // ViaCEP não retorna 'regiao', pode precisar ajustar
      ) {
        const filtro = { _id: clienteId };

        const autenticacao = {
          $push: {
            Location: [
              {
                cep: cep,
                logradouro: logradouro,
                complemento: complemento,
                unidade: unidade,
                bairro: bairro,
                localidade: localidade,
                estado: estado,
                regiao: regiao,
              },
            ],
          },
        };

        const opcoes = { new: true };

        const resultado = await clientes.findOneAndUpdate(
          filtro,
          autenticacao,
          opcoes
        );

        return { status: 201, data: resultado?.Location };
      }

      return { status: 400, message: "CEP inválido." };
    } catch (error) {
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  getclientLocalizacao: async (clienteid: ObjectId) => {
    try {
      const resultado = await clientes.findById(clienteid, {
        Location: 1,
        _id: 0,
      });
      if (!resultado) {
        return { status: 404, message: "Cliente não encontrado" };
      }
      return { status: 201, data: resultado.Location };
    } catch (error) {
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  atualizarClienteLocalzizacao: async (
    clienteId: ObjectId,
    localizacaoId: ObjectId,
    cep: string,
    logradouro: string,
    complemento: string,
    unidade: string,
    bairro: string,
    localidade: string,
    estado: string
  ) => {
    try {
      const cliente = await clientes.findById(clienteId);
      if (!cliente) {
        return { status: 404, message: "Cliente não encontrado!" };
      }
      const localidadeAntiga = await clientes.findById(clienteId, {
        Location: { $elemMatch: { _id: localizacaoId } },
      });
      if (!localidadeAntiga || !localidadeAntiga.Location?.length) {
        return { status: 404, message: "Cep não encontrado!" };
      }
      const filtro = { _id: clienteId, "Location._id": localizacaoId };
      const atualizacao = {
        $set: {
          "Location.$.cep": cep,
          "Location.$.logradouro": logradouro,
          "Location.$.complemento": complemento,
          "Location.$.unidade": unidade,
          "Location.$.bairro": bairro,
          "Location.$.localidade": localidade,
          "Location.$.estado": estado,
        },
      };
      const resultado = await clientes.findOneAndUpdate(filtro, atualizacao, {
        new: true,
      });
      if (!resultado)
        return { status: 404, message: "Localização não encontrada!" };
      return { status: 201, data: resultado };
    } catch (error) {
      console.log(error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  deleteClienteLocalzizacao: async (
    clienteId: ObjectId,
    localizacaoId: ObjectId
  ) => {
    try {
      const cliente = await clientes.findById(clienteId);
      if (!cliente) {
        return { status: 404, message: "Cliente não encontrado!" };
      }
      const filtro = { _id: clienteId };
      const deleteCep = {
        $pull: {
          Location: {
            _id: localizacaoId,
          },
        },
      };
      const localizaçaoDeletada = await clientes.updateOne(filtro, deleteCep);
      if (localizaçaoDeletada.modifiedCount == 0) {
        return { status: 404, message: "Localizaçao não encontrado!" };
      }
      return { status: 201, data: localizaçaoDeletada };
    } catch (error) {
      console.log(error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  UpdateClientFavoritos: async (clienteId: ObjectId, produtoID: ObjectId) => {
    const cliente = await clientes.findById(clienteId);
    if (!cliente) {
      return { status: 404, message: "Cliente não encontrado!" };
    }
    const produto = await Product.findById(produtoID);
    if (!produto) {
      return { status: 404, message: "produto nao existe!" };
    }
    const jaExiste = cliente.Favorites?.some(
      (Favorite) => Favorite.Productid?.toString() === produto.id
    );
    if (jaExiste) {
      return { status: 409, message: "Produto já existe nos seus favoritos!" };
    }
    const filtro = { _id: clienteId };
    const favoritos = { $addToSet: { Favorites: { Productid: produto.id } } };
    const opcoes = { new: true };
    const resultado = await clientes.findOneAndUpdate(
      filtro,
      favoritos,
      opcoes
    );
    if (!resultado) {
      // Se chegou aqui, o update falhou!
      return {
        status: 400,
        message:
          "ERRO: Não foi possível atualizar o cliente. Verifique os dados.",
      };
    }
    return { status: 201, data: resultado.Favorites };
  },

  GetClienteFavoritos: async (ClienteId: ObjectId) => {
    const cliente = await clientes
      .findById(ClienteId)
      .populate("Favorites.Productid");
    if (!cliente) {
      return { status: 404, message: "Cliente não encontrado!" };
    }
    if (cliente && cliente.Favorites && cliente.Favorites?.length > 0) {
      return { status: 201, data: cliente.Favorites };
    }
    return {
      status: 200,
      message: "O carrinho de compras está vazio. Adicione itens!",
    };
  },

  DeleteClienteFavoritos: async (ClienteId: ObjectId, produtoID: ObjectId) => {
    const cliente = await clientes.findById(ClienteId);
    if (!cliente) {
      return { status: 404, message: "Cliente não encontrado!" };
    }
    const filtro = { _id: ClienteId };
    const favoritoDeletado = {
      $pull: {
        Favorites: {
          Productid: produtoID,
        },
      },
    };
    const favorito = await clientes.updateOne(filtro, favoritoDeletado);
    console.log(favorito);
    if (favorito.modifiedCount === 0) {
      return { status: 404, message: "Favorito não encontrado!" };
    }
    return { status: 200, message: "Favorito apagado com sucesso!!" };
  },
};

export default clientService;
