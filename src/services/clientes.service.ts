import { ObjectId } from 'mongoose';
import  clientes, { IClients } from '../models/Clientes.model';
import { cpf } from 'cpf-cnpj-validator';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import dotenv from 'dotenv';
import twilio from 'twilio';
import Product from '../models/product.model'
// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({ path: './.env'});
var buscaCep = require('busca-cep');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;
const client = twilio(accountSid, authToken);
if (!verifySid) { // Verifica se o SID de verificação está definido
    throw new Error('TWILIO_VERIFY_SID não está definido no .env');
}

const clientService = {
    // A função agora recebe o ID do cliente e o novo CPF
    updateClientCpf: async (clienteId: ObjectId, novoCPF: string) => {
        try {
            // Remove todos os caracteres não numéricos do CPF
            const cpfLimpo = String(novoCPF).replace(/\D/g, '');
            // Verifica se o CPF é válido usando a biblioteca cpf-cnpj-validator
            const ehValido = cpf.isValid(cpfLimpo) 
            // Se o CPF não for válido, retorna uma mensagem de erro
            if(!ehValido) {
                return { error: true, message: `O CPF ${novoCPF} é INVÁLIDO.` };
            }
            // Filtro para buscar o CPF no banco de dados
            const filtroCPF = { CPF: cpfLimpo };  
            // Verifica se já existe um cliente com o mesmo CPF 
            const clienteEncontrado = await clientes.findOne(filtroCPF);
            // Se já existir, retorna uma mensagem de erro
            if (clienteEncontrado) { 
            return  { error:  409, success: false, message: `Resultado: ${novoCPF} já cadastrado.` };
            }
            // 1. Critério de busca: Encontrar o cliente pelo seu _id
            const filtro = {Clients: clienteId };
            // 2. Dados a serem atualizados.
            // Usamos o operador '$set' para garantir que apenas o campo CPF será alterado.
            const autenticacao = { $set: {CPF: cpfLimpo}};
            // Define as opções para a atualização
            const opcoes = { new: true};
            // 3. Opções: { new: true } faz com que ele retorne o documento DEPOIS da atualização.
            const clienteAtualizado = await clientes.findOneAndUpdate(filtro, autenticacao, opcoes);
            // 4. Executar a busca e atualização
            if(!clienteAtualizado){
                return { error: true, message: `Cliente com ID ${clienteId} não foi encontrado.` };
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
            // Remove todos os caracteres não numéricos do número de telefone
            const telefone = parsePhoneNumberFromString(novoNUMBER, Pais )
            // Verifica se o número de telefone é válido
         if (!telefone || !telefone.isValid()) { 
            console.log(`O telefone "${novoNUMBER}" é INVÁLIDO.`);
            throw new Error('Número de telefone inválido.');
        }
         // Formata o número para o padrão E.164
         const numeroEmFormatoInternacional = telefone.format('E.164') 
         // 1. Critério de busca: Encontrar o cliente pelo seu _id
         const filtro = {Clients: clienteId };
         // Usamos o operador '$set' para garantir que apenas o campo telefone será alterado.
         const autenticacao = { $set: {telefone: [{ Number: numeroEmFormatoInternacional, auth: 'false' }]}};
         // Define as opções para a atualização, true faz com que ele retorne o documento DEPOIS da atualização.
         const opcoes = { new: true};
         // Atualiza o cliente com o novo número de telefone
         const clienteAtualizado = await clientes.findOneAndUpdate(filtro, autenticacao, opcoes) 
         // Se o cliente não for encontrado, retorna uma mensagem de erro
          if(!clienteAtualizado){
                return { error: true, message: `Cliente com ID ${clienteId} não foi encontrado.` };
            }
         // Se a atualização for bem-sucedida, retorna o cliente atualizado
         console.log('Numero adicionado com sucesso!', clienteAtualizado);
         return clienteAtualizado;
     } catch (error) {
         console.error("Erro ao adicionar NUMERO:", error);
         throw new Error("Falha ao atualizar o cliente.");
        }
    },
    // metodo para iniciar a verificação do telefone
    iniciarVerificacaoTelefone: async (clienteId: ObjectId) => { 
        try {
            const filtro = {Clients: clienteId}
            const resultadoDaBusca = await clientes.findOne(filtro, 'telefone.Number -_id');
            let numeroDoTelefone; // Variável para guardar o número final
             // Verificamos se a busca retornou algo e se o array 'telefone' não está vazio
            if (resultadoDaBusca && resultadoDaBusca.telefone && resultadoDaBusca.telefone.Number ) {
            // Aqui, 'Number' é o campo que contém o número de telefone adiciona na variável 'numeroDoTelefone' para ser usado posteriormente
            numeroDoTelefone = resultadoDaBusca.telefone.Number; 
            } else {
            // Se não encontrarmos, é importante tratar o erro
            throw new Error('Não foi possível encontrar um número de telefone para este cliente.');
                }
             // Extrai o número de telefone do array
            const NumeroForaDoArray = numeroDoTelefone[0] 
             // Inicia o processo de verificação
            const verification = await client.verify.v2.services(verifySid) 
            .verifications
            .create({ to: NumeroForaDoArray, channel: 'sms' });
            // Variável para armazenar o número censurado
            const NumerosCensurrado = "XXXXXXXXX-" 
            // Censura o número de telefone, mantendo apenas os últimos 4 dígitos
            const NumeroCensurrado =  NumerosCensurrado + NumeroForaDoArray[10] + NumeroForaDoArray[11] + NumeroForaDoArray[12] + NumeroForaDoArray[13]
            // Retorna uma mensagem de sucesso, informando que o SMS foi enviado com sucesso
             return { success: true, message: `SMS de verificação enviado para o numero ${NumeroCensurrado}` }; 
        } catch (error) {
            console.error("Erro ao enviar SMS via Twilio:", error);
            throw new Error('Falha ao enviar SMS de verificação.');
        } 
    },
    //metodo para confirmar o codigo de verificação do telefone
    confirmarCodigoTelefone: async (clienteId: ObjectId,numeroTelefone: string, codigo: string) => { 
        try { 
            const filtro = {Clients: clienteId}
            const resultadoDaBusca = await clientes.findOne(filtro, 'telefone.Number -_id');
            let numeroDoTelefone; // Variável para guardar o número final
             // Verificamos se a busca retornou algo e se o array 'telefone' não está vazio
            if (resultadoDaBusca && resultadoDaBusca.telefone && resultadoDaBusca.telefone.Number ) {
             numeroDoTelefone = resultadoDaBusca.telefone.Number;
            } else {
             // Se não encontrarmos, é importante tratar o erro
            throw new Error('Não foi possível encontrar um número de telefone para este cliente.');
             }
            const NumeroForaDoArray = numeroDoTelefone[0]
             // recebe o numero de telefone e o codigo de verificação 
            const verificationCheck = await client.verify.v2.services(verifySid)
            .verificationChecks
            .create({ to: NumeroForaDoArray, code: codigo }); 
             // Verifica o status da verificação se o rota devolver 'approved' significa que o código foi verificado com sucesso
            if (verificationCheck.status === 'approved') {
             // Filtro para encontrar o cliente pelo ID
            const filtro = {Clients: clienteId }; 
            // Atualiza o cliente com o número de telefone verificado 
            // Usamos o operador '$set' para garantir que apenas o campo telefone será alterado.
            const autenticacao = { $set: {telefone: [{ Number: numeroTelefone, auth: 'true' }]}}; 
            // Define as opções para a atualização, true faz com que ele retorne o documento DEPOIS da atualização.
            const opcoes = { new: true};
            // Executa a atualização no banco de dados
            await clientes.findOneAndUpdate(filtro, autenticacao, opcoes);
            // Se a atualização for bem-sucedida, retorna uma mensagem de sucesso
            return { success: true, message: 'Número de telefone verificado com sucesso!' };
        } else {
            // Se o código de verificação for inválido, retorna uma mensagem de erro
            return { success: false, message: 'Código de verificação inválido.' };
     }
        } catch (error) {
            //
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