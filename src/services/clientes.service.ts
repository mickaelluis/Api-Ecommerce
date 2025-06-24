import { ObjectId } from 'mongoose';
import  clientes, { IClients } from '../models/Clientes.model';
import { cpf } from 'cpf-cnpj-validator';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import dotenv from 'dotenv';
import twilio from 'twilio';
import Product from '../models/product.model'

dotenv.config({ path: './.env'});
var buscaCep = require('busca-cep');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;
const client = twilio(accountSid, authToken);
if (!verifySid) {
    throw new Error('TWILIO_VERIFY_SID não está definido no .env');
}

const clientService = {
    // A função agora recebe o ID do cliente e o novo CPF
    updateClientCpf: async (clienteId: ObjectId, novoCPF: string) => {
        try {
            // Verifica se o CPF é válido usando a biblioteca cpf-cnpj-validator
            const ehValido = cpf.isValid(novoCPF) 
            // Se o CPF não for válido, retorna uma mensagem de erro
            if(!ehValido) {
                console.log(`O CPF ${novoCPF} é INVÁLIDO.`);
                return false;
            }
             // 1. Critério de busca: Encontrar o cliente pelo seu _id
            const filtro = {Clients: clienteId };
            // 2. Dados a serem atualizados.
            // Usamos o operador '$set' para garantir que apenas o campo CPF será alterado.
            const autenticacao = { $set: {CPF: novoCPF}};
            // Define as opções para a atualização
            const opcoes = { new: true};
            // 3. Opções: { new: true } faz com que ele retorne o documento DEPOIS da atualização.
            const clienteAtualizado = await clientes.findOneAndUpdate(filtro, autenticacao, opcoes);
            // 4. Executar a busca e atualização
            if(!clienteAtualizado){
                console.log(`Cliente com ID ${clienteId} não foi encontrado.`);
                return null;
            }
            console.log('CPF adicionado com sucesso!', clienteAtualizado);
            return clienteAtualizado;
        } catch (error) {
            console.error("Erro ao adicionar CPF:", error);
            throw new Error("Falha ao atualizar o cliente.");
        }
    },

     updateClientNumber: async (clienteId: ObjectId, novoNUMBER: string, Pais: CountryCode) => {
        try {
            const telefone = parsePhoneNumberFromString(novoNUMBER, Pais )
         if (!telefone || !telefone.isValid()) {
            console.log(`O telefone "${novoNUMBER}" é INVÁLIDO.`);
            throw new Error('Número de telefone inválido.');
        }
        
         const numeroEmFormatoInternacional = telefone.format('E.164')

         const filtro = {Clients: clienteId };

         const autenticacao = { $set: {telefone: [{ Number: numeroEmFormatoInternacional, auth: 'false' }]}};

         const opcoes = { new: true};

         const clienteAtualizado = await clientes.findOneAndUpdate(filtro, autenticacao, opcoes);

          if(!clienteAtualizado){
                console.log(`Cliente com ID ${clienteId} não foi encontrado.`);
                return null;
            }
            console.log('Numero adicionado com sucesso!', clienteAtualizado);
            return clienteAtualizado;
     } catch (error) {
            console.error("Erro ao adicionar NUMERO:", error);
            throw new Error("Falha ao atualizar o cliente.");
        }
    },

    iniciarVerificacaoTelefone: async (numeroTelefone: string) => {
        try {
            const verification = await client.verify.v2.services(verifySid)
            .verifications
            .create({ to: numeroTelefone, channel: 'sms' });

            console.log('Status do envio:', verification.status);
             return { success: true, message: 'SMS de verificação enviado.' };
        } catch (error) {
            console.error("Erro ao enviar SMS via Twilio:", error);
            throw new Error('Falha ao enviar SMS de verificação.');
        } 
    },

    confirmarCodigoTelefone: async (clienteId: ObjectId,numeroTelefone: string, codigo: string) => {
        try {
          const verificationCheck = await client.verify.v2.services(verifySid)
         .verificationChecks
         .create({ to: numeroTelefone, code: codigo });

            console.log('Status da verificação:', verificationCheck.status);

            if (verificationCheck.status === 'approved') {

            const filtro = {Clients: clienteId };
            const autenticacao = { $set: {telefone: [{ Number: numeroTelefone, auth: 'true' }]}};
            const opcoes = { new: true};

            await clientes.findOneAndUpdate(filtro, autenticacao, opcoes);

            return { success: true, message: 'Número de telefone verificado com sucesso!' };
        } else {
            return { success: false, message: 'Código de verificação inválido.' };
     }
        } catch (error) {
            console.error("Erro ao adicionar telefone:", error);
            throw new Error("Falha ao atualizar o cliente.");
        }
    },

    updateClientLocalizacao: async ( clienteId: ObjectId, cep: string, logradouro: string, 
        complemento: string, unidade: string, 
        bairro: string, localidade: string, estado: string, regiao: string ) => {
        try {
            var resposta = buscaCep(`${cep}`, {sync: true});
            if ( resposta.localidade == localidade  && resposta.estado == estado  && resposta.regiao == regiao ) {

            const filtro = {Clients: clienteId };

            const autenticacao = { $push: {Location: [{ cep: cep,logradouro: logradouro, complemento: complemento, unidade: unidade, bairro: bairro, localidade: localidade, estado: estado, regiao:regiao   }]}};

            const opcoes = { new: true};

            await clientes.findOneAndUpdate(filtro, autenticacao, opcoes);

            return { success: true, message: 'cep verificado com sucesso!' };
                
            }
            return { success: false, message: 'cep de verificação inválido.' };
        } catch (error) {
            console.error("Erro ao adicionar LOCALIZÇÂO:", error);
            throw new Error("Falha ao atualizar o cliente.");
        } 
    },

    UpdateClientFavoritos: async ( clienteID: ObjectId, produtoID: ObjectId) => {
        const cliente = await clientes.findOne({ Clients: clienteID });
        if (!cliente) {
            return { success: false, message: "Cliente não encontrado!" };
        }
        const produto = await Product.findById(produtoID)
        if (!produto) {
            return  { seccess: false, menssage: "produto nao existe!" }
        }
        const jaExiste = cliente.Favorites?.some(fav => fav.Products?.Productid?.toString() === produto.id.toString());
        if (jaExiste) {
            return { success: false, message: "Produto já existe nos seus favoritos!" };
        }
        const filtro = {Clients: clienteID };
        const favoritos ={ $push: {Favorites: [{Products: {Productid: produto.id,  name: produto.name,  
                            description: produto.description,   price: produto.price,  imageUrl: produto.imageUrl} }]} }
         const opcoes = { new: true};
        await clientes.findOneAndUpdate(filtro, favoritos, opcoes)
        return { success: true, message: ' Favorito adiconado com sucesso!' };
    },
}

export default clientService;