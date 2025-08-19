import { ObjectId } from "mongoose";
import clientes, { IClients } from "../models/Clientes.model";
import User, { IUser } from "../models/user.model";
import { cpf } from "cpf-cnpj-validator";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import Product from "../models/product.model";
import { runTransaction } from "../database/database";
import { boolean } from "zod";
const axios = require("axios");

// Serviço para manipulação de clientes
// Este serviço contém funções para criar, atualizar, deletar e buscar clientes
const clientService = {
   // função para buscar os cliente
  getCliente: async () => {
    try {
      const clientes = await User.find({ role: "Clients" });
      if(!clientes){
        return {status: 400, message: "Você nao tem nenhum cliente!!"}
      }
      return{ status: 201, data: clientes }
    } catch (error) {
      // Se ocorrer um erro durante a transação, imprime o erro no console
      console.error("Erro ao apagar cliente:", error);
      // Lança um erro para indicar que a transação falhou
      // Isso pode ser capturado pelo chamador para lidar com o erro de forma adequada
      throw new Error("Falha ao atualizar o cliente.");
    }
  },


  // função para deletar um cliente
  deletarCliente: async (ClienteId: ObjectId, userId: ObjectId) => {
    try {
      // Verifica se o cliente existe
      // Isso é importante para garantir que o cliente associado ao usuário também seja removido
      const cliente = await clientes.findById(ClienteId);
      if (!cliente) {
        return { status: 404, message: "cliente não encontrado!!" };
      }
      // Verifica se o usuário existe
      // Isso é importante para garantir que o usuário associado ao cliente também seja removido
      const user = await User.findById(userId);
      if (!user) {
        return { status: 404, message: "Usuario não encontrado!!" };
      }
      // Inicia a transação
      // A transação garante que ambas as operações (deletar cliente e deletar usuário)
      // sejam atômicas, ou seja, ambas serão concluídas com sucesso ou nenhuma delas
      const resultado = runTransaction(async (session) => {
        // Deleta o usuário associado ao cliente
        // Se o usuário não for encontrado, lança um erro para abortar a transação
        const deleteUser = await User.findByIdAndDelete(
          { _id: userId },
          { session }
        );
        // Se o usuário não for encontrado, lança um erro para abortar a transação  
        // Isso garante que o usuário seja removido antes de tentar remover o cliente
        if (!deleteUser) {
          // Lançar um erro aqui fará a transação ser abortada (rollback)
          throw new Error("Cliente não encontrado para apagar.");
        }
        // Apaga o cliente
        // Isso garante que o cliente seja removido após o usuário ser removido
        const deleteClinete = await clientes.findByIdAndDelete(
          { _id: ClienteId },
          { session }
        );
        // Se o cliente não for encontrado, lança um erro para abortar a transação
        if (!deleteClinete) {
          // Lançar um erro aqui fará a transação ser abortada (rollback)
          throw new Error("Cliente não encontrado para apagar.");
        }
        // Se ambos os deletes forem bem-sucedidos, retorna o cliente deletado
        // Isso indica que a transação foi concluída com sucesso
        return { message: "Cliente e usuário associado deletados com sucesso."};
      });
      // Se o resultado for falso, significa que a transação falhou
      // Isso pode acontecer se algum dos deletes falhar ou se um erro for lançado
      if (!resultado) {
        return {
          status: 400,
          message:
            "Não foi possivel apagar seus dados, entre em contato com o Suporte!!!",
        };
      }
      // Se a transação foi bem-sucedida, retorna uma mensagem de sucesso
      // Isso indica que o cliente e o usuário foram removidos com sucesso
       return{ status: 200, message: (await resultado).message}
    } catch (error) {
      // Se ocorrer um erro durante a transação, imprime o erro no console
      console.error("Erro ao apagar cliente:", error);
      // Lança um erro para indicar que a transação falhou
      // Isso pode ser capturado pelo chamador para lidar com o erro de forma adequada
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

  // A função deleta o CPF do cliente
  // Ela recebe o ID do cliente e remove o campo CPF do documento
  deleteClienteCpf: async (clienteId: ObjectId) => {
    const session = clientes.startSession();
    try { 
      // Verifica se o cliente existe
      const cliente = clientes.findById(clienteId);
      if (!cliente) {
        return { status: 404, message: "cliente não encontrado!!" };
      }
      // 1. Critério de busca: Encontrar o cliente pelo seu _id
      const filtro = { _id: clienteId };
      // 2. Dados a serem atualizados.
      // Usamos o operador '$unset' para remover o campo CPF do documento.
      // Isso garante que o campo CPF será removido do cliente.
      // Se o campo CPF não existir, ele simplesmente não fará nada.
      const deleteCPF = {
        $unset: {
          CPF: "",
        },
      };
      // 3. Executar a atualização
      // Usamos o método updateOne para atualizar o cliente com o filtro e os dados de atualização.
      // O método updateOne retorna um objeto que contém informações sobre a atualização.
      const clienteAtualizado = await clientes.updateOne(filtro, deleteCPF);
      // 4. Verifica se a atualização foi bem-sucedida
      // Se o cliente não for encontrado, retorna uma mensagem de erro
      if (!clienteAtualizado) {
        return { status: 404, message: "cliente não tem nenhum CPF!!" };
      }
      // Se a atualização for bem-sucedida, retorna uma mensagem de sucesso
      // Isso indica que o CPF foi removido com sucesso do cliente
      return { status: 200, message: "CPF apagado com sucesso" };
    } catch (error) {
      // Se ocorrer um erro durante a atualização, imprime o erro no console
      // Isso pode ser útil para depuração e identificação de problemas
      console.error("Erro ao adicionar CPF:", error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  // A função agora recebe o ID do cliente, o novo número e o país
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

  // A função agora recebe o ID do cliente, o novo número e o país
  // Ela atualiza o número de telefone do cliente no banco de dados 
  atualizarCienteNumber: async (
    clienteId: ObjectId,
    numberNew: string,
    Pais: CountryCode
  ) => {
    try {
      // Verifica se o cliente existe
      const client = await clientes.findById(clienteId);
      if (!client) {
        return { status: 404, message: `Cleinte não foi encontrado.` };
      }
      // Remove todos os caracteres não numéricos do número de telefone
      // Usa a biblioteca libphonenumber-js para analisar e validar o número
      const telefone = parsePhoneNumberFromString(numberNew, Pais);
      if (!telefone || !telefone.isValid()) {
        return { status: 400, message: "Numero de telefone invalido!!!" };
      }
      // Formata o número para o padrão E.164 
      const numeroEmFormatoInternacional = telefone.format("E.164");
      // 1. Critério de busca: Encontrar o cliente pelo seu _id
      const filtro = { _id: clienteId };
      // Usamos o operador '$set' para garantir que apenas o campo telefone será alterado.
      // Atualiza o campo telefone com o novo número e define auth como "false"
      const atualizacao = {
        $set: {
          telefone: { Number: numeroEmFormatoInternacional, auth: "false" },
        },
      };
      // Atualiza o cliente com o novo número de telefone
      // O método findOneAndUpdate retorna o documento atualizado
      // A opção { new: true } faz com que ele retorne o documento DEPOIS da atualização
      const numeroAtualizado = await clientes.findOneAndUpdate(
        filtro,
        atualizacao,
        { new: true }
      );
      // Se o cliente não for encontrado, retorna uma mensagem de erro
      if (!numeroAtualizado) {
        return {
          status: 404,
          Message: "nao foi possivel cadastra esse numero",
        };
      }
      // Se a atualização for bem-sucedida, retorna o cliente atualizado
      return { status: 201, data: numeroAtualizado };
    } catch (error) {
      // se ocorrer um erro durante a atualização, imprime o erro no console 
      console.error("Erro ao adicionar NUMERO:", error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  // A função deleta o número de telefone do cliente
  // Ela recebe o ID do cliente e remove o campo telefone do documento  
  deliteCilenteNumber: async (clienteId: ObjectId) => {
    try {
      // Verifica se o cliente existe
      const client = await clientes.findById(clienteId);
      if (!client) {
        return { status: 404, message: `Cleinte não foi encontrado.` };
      }
      // 1. Critério de busca: Encontrar o cliente pelo seu _id
      const filtro = { _id: clienteId };
      // Usamos o operador '$set' para remover o campo telefone do documento.
      // Isso garante que o campo telefone será removido do cliente.
      const deleteNumber = {
        $set: {
          telefone: {},
        },
      };
      // 3. Executar a atualização
      // Usamos o método updateOne para atualizar o cliente com o filtro e os dados de atualização.
      // O método updateOne retorna um objeto que contém informações sobre a atualização.
      await clientes.updateOne(filtro, deleteNumber);
      // Se a atualização for bem-sucedida, retorna uma mensagem de sucesso 
      return { status: 201, message: "Numero apagado" };
    } catch (error) {
      // Se ocorrer um erro durante a atualização, imprime o erro no console
      // Isso pode ser útil para depuração e identificação de problemas
      console.error("Erro ao adicionar NUMERO:", error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  // A função agora recebe o ID do cliente e os dados de localização
  // Ela atualiza a localização do cliente no banco de dados
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
      // Verifica se o cliente existe
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
        resposta.localidade === localidade &&// ViaCEP usa 'localidade' no lugar de 'cidade'
        resposta.estado === estado && // ViaCEP usa 'uf' no lugar de 'estado'
        resposta.regiao === regiao // ViaCEP não retorna 'regiao', pode precisar ajustar
      ) {
        // 1. Critério de busca: Encontrar o cliente pelo seu _id
        const filtro = { _id: clienteId };
        // Usamos o operador '$push' para adicionar uma nova localização ao array Location.
        // Isso permite que o cliente tenha múltiplas localizações armazenadas.
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
        // Define as opções para a atualização, true faz com que ele retorne o documento DEPOIS da atualização.
        const opcoes = { new: true };
        // Atualiza o cliente com a nova localização
        const resultado = await clientes.findOneAndUpdate(
          filtro,
          autenticacao,
          opcoes
        );
        // Se o cliente não for encontrado, retorna uma mensagem de erro
        if (!resultado) {
          return { status: 404, message: `Cliente não foi encontrado.` };
        }
        // Se a atualização for bem-sucedida, retorna a nova localização adicionada
        return { status: 201, data: resultado?.Location };
      }
      // Se a validação falhar, retorna uma mensagem de erro
      return { status: 400, message: "CEP inválido." };
    } catch (error) {
      // Se ocorrer um erro durante a atualização, imprime o erro no console
      console.error("Erro ao adicionar Localização:", error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },
  // Função para obter as localizações de um cliente específico
  getclientLocalizacao: async (clienteid: ObjectId) => {
    try {
      // Verifica se o cliente existe
      const resultado = await clientes.findById(clienteid, {
        Location: 1,
        _id: 0,
      });
      // Se o cliente não for encontrado, retorna uma mensagem de erro
      if (!resultado) {
        return { status: 404, message: "Cliente não encontrado" };
      }
      // Retorna as localizações do cliente
      return { status: 201, data: resultado.Location };
    } catch (error) {
      // Se ocorrer um erro durante a busca, imprime o erro no console
      console.error("Erro ao buscar localizações:", error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  // A função agora recebe o ID do cliente, o ID da localização e os novos dados de localização
  // Ela atualiza a localização específica do cliente no banco de dados
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
      // Verifica se o cliente existe
      const cliente = await clientes.findById(clienteId);
      if (!cliente) {
        return { status: 404, message: "Cliente não encontrado!" };
      }
      // Verifica se a localização existe
      const localidadeAntiga = await clientes.findById(clienteId, {
        Location: { $elemMatch: { _id: localizacaoId } },
      });
      // Se a localização não for encontrada, retorna uma mensagem de erro
      if (!localidadeAntiga || !localidadeAntiga.Location?.length) {
        return { status: 404, message: "Cep não encontrado!" };
      }
      // Filtro para encontrar o cliente e a localização específica no array Location
      const filtro = { _id: clienteId, "Location._id": localizacaoId };
      // Atualização dos campos da localização específica usando o operador $set
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
      // Atualiza a localização específica do cliente
      // O método findOneAndUpdate retorna o documento atualizado
      const resultado = await clientes.findOneAndUpdate(filtro, atualizacao, {
        new: true,
      });
      // Se a atualização falhar, retorna uma mensagem de erro
      if (!resultado){
        return { status: 404, message: "Localização não encontrada!" };
      }
      // Se a atualização for bem-sucedida, retorna o cliente atualizado  
      return { status: 201, data: resultado };
    } catch (error) {
      // Se ocorrer um erro durante a atualização, imprime o erro no console
      console.log(error);
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  // A função agora recebe o ID do cliente e o ID da localização a ser deletada
  // Ela remove a localização específica do cliente no banco de dados
  deleteClienteLocalzizacao: async (
    clienteId: ObjectId,
    localizacaoId: ObjectId
  ) => {
    try {
      // Verifica se o cliente existe
      const cliente = await clientes.findById(clienteId);
      if (!cliente) {
        return { status: 404, message: "Cliente não encontrado!" };
      }
      // Filtro para encontrar o cliente pelo seu ID
      const filtro = { _id: clienteId };
      // Operação de remoção usando o operador $pull para remover a localização específica do array Location
      const deleteCep = {
        $pull: {
          Location: {
            _id: localizacaoId,
          },
        },
      };
      // Executa a atualização para remover a localização
      // O método updateOne retorna um objeto que contém informações sobre a atualização
      const localizaçaoDeletada = await clientes.updateOne(filtro, deleteCep);
      // Verifica se alguma localização foi realmente removida
      // Se modifiedCount for 0, significa que a localização não foi encontrada
      if (localizaçaoDeletada.modifiedCount == 0) {
        return { status: 404, message: "Localizaçao não encontrado!" };
      }
      // Se a remoção for bem-sucedida, retorna uma mensagem de sucesso
      return { status: 201, message: "Localizaçao apagada com sucesso" };
    } catch (error) {
      // Se ocorrer um erro durante a remoção, imprime o erro no console
      console.log("Erro ao deletar localizações:", error);  
      throw new Error("Falha ao atualizar o cliente.");
    }
  },

  // Funções para manipulação dos favoritos do cliente
  // Essas funções permitem adicionar, buscar e remover produtos dos favoritos do cliente
  UpdateClientFavoritos: async (clienteId: ObjectId, produtoID: ObjectId) => {
    // Verifica se o cliente existe
    const cliente = await clientes.findById(clienteId);
    if (!cliente) {
      return { status: 404, message: "Cliente não encontrado!" };
    }
    // Verifica se o produto existe
    const produto = await Product.findById(produtoID);
    if (!produto) {
      return { status: 404, message: "produto nao existe!" };
    }
    // Verifica se o produto já está nos favoritos do cliente
    const jaExiste = cliente.Favorites?.some(
      (Favorite) => Favorite.Productid?.toString() === produto.id
    );
    if (jaExiste) {
      return { status: 409, message: "Produto já existe nos seus favoritos!" };
    }
    // Adiciona o produto aos favoritos do cliente
    const filtro = { _id: clienteId };
    // Usa o operador $addToSet para evitar duplicatas
    const favoritos = { $addToSet: { Favorites: { Productid: produto.id } } };
    // Define as opções para a atualização, true faz com que ele retorne o documento DEPOIS da atualização.
    const opcoes = { new: true };
    // Atualiza o cliente com o novo favorito
    // O método findOneAndUpdate retorna o documento atualizado
    const resultado = await clientes.findOneAndUpdate(
      filtro,
      favoritos,
      opcoes
    );
    // Verifica se a atualização foi bem-sucedida
    if (!resultado) {
      // Se chegou aqui, o update falhou!
      return {
        status: 400,
        message:
          "ERRO: Não foi possível atualizar o cliente. Verifique os dados.",
      };
    }
    // Retorna a lista atualizada de favoritos do cliente
    return { status: 201, data: resultado.Favorites };
  },

  // Função para buscar os favoritos de um cliente específico
  GetClienteFavoritos: async (ClienteId: ObjectId) => {
    // Verifica se o cliente existe e popula os detalhes dos produtos favoritos
    const cliente = await clientes
      .findById(ClienteId)
      .populate("Favorites.Productid");
      // Se o cliente não for encontrado, retorna uma mensagem de erro
    if (!cliente) {
      return { status: 404, message: "Cliente não encontrado!" };
    }
    // Verifica se o cliente tem favoritos e retorna a lista
    if (cliente && cliente.Favorites && cliente.Favorites?.length > 0) {
      return { status: 201, data: cliente.Favorites };
    }
    // Se o cliente não tiver favoritos, retorna uma mensagem indicando que o carrinho está vazio
    return {
      status: 200,
      message: "O carrinho de compras está vazio. Adicione itens!",
    };
  },

  // Função para remover um produto dos favoritos do cliente
  DeleteClienteFavoritos: async (ClienteId: ObjectId, produtoID: ObjectId) => {
    // Verifica se o cliente existe
    const cliente = await clientes.findById(ClienteId);
    if (!cliente) {
      return { status: 404, message: "Cliente não encontrado!" };
    }
    // Verifica se o produto existe 
    const filtro = { _id: ClienteId };
    // Operação de remoção usando o operador $pull para remover o produto específico do array Favorites
    const favoritoDeletado = {
      $pull: {
        Favorites: {
          Productid: produtoID,
        },
      },
    };
    // Executa a atualização para remover o favorito
    // O método updateOne retorna um objeto que contém informações sobre a atualização
    const favorito = await clientes.updateOne(filtro, favoritoDeletado);
    // Verifica se alguma favorito foi realmente removido
    // Se modifiedCount for 0, significa que o favorito não foi encontrado
    if (favorito.modifiedCount === 0) {
      return { status: 404, message: "Favorito não encontrado!" };
    }
    // Se a remoção for bem-sucedida, retorna uma mensagem de sucesso
    return { status: 200, message: "Favorito apagado com sucesso!!" };
  },
};

// Exporta o serviço de clientes para ser utilizado em outras partes da aplicação
export default clientService;
