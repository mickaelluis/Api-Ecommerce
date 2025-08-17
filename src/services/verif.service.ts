import { ObjectId } from 'mongoose';
import  clientes, { IClients } from '../models/Clientes.model';
import dotenv from 'dotenv';
import twilio from 'twilio';
dotenv.config({ path: './.env'});
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;
const client = twilio(accountSid, authToken);
if (!verifySid) { // Verifica se o SID de verificação está definido
    throw new Error('TWILIO_VERIFY_SID não está definido no .env');
}

const verificacao = {
    // metodo para iniciar a verificação do telefone
    iniciarVerificacaoTelefone: async (clienteId: ObjectId) => { 
        try {
            const filtro = {userid: clienteId}
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
            const filtro = {userid: clienteId}
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
            const filtro = {userid: clienteId }; 
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
}