// Importa a classe de configuração do SDK
import {  MercadoPagoConfig, Payment } from "mercadopago";
require("dotenv").config();
const token = process.env.MERCADO_PAGO_TOKEN;
const key = process.env.MERCADO_PAGO_KAY;


// 1. Configuração do Cliente (como visto anteriormente)
const client = new MercadoPagoConfig( {accessToken: `${token}`,options: { timeout: 5000 }} );

// 2. Função assíncrona para processar o pagamento
async function processPayment(paymentData: any) {
  try {
    // 3. Instancia o serviço de Pagamento com o cliente configurado
    const payment = new Payment(client);

    // 4. Cria o corpo da requisição (payload)
    const body = {
      transaction_amount: paymentData.transaction_amount, // Ex: 100.50
      token: paymentData.token, // O token do cartão gerado no front-end
      description: 'Descrição do produto',
      installments: paymentData.installments, // Número de parcelas
      payment_method_id: paymentData.payment_method_id, // Ex: 'visa'
      payer: {
        email: paymentData.payer.email, // Email do comprador
        identification: {
          type: paymentData.payer.identification.type, // Ex: 'CPF'
          number: paymentData.payer.identification.number
        }
      }
    };

    // 5. Envia a requisição para criar o pagamento
    const result = await payment.create({ body });

    console.log('Pagamento criado com sucesso:', result);
    return { success: true, data: result };

  } catch (error: any) {
    // 6. Tratamento de erros
    console.error('Erro ao processar o pagamento:', error);
    // O SDK geralmente fornece detalhes do erro no corpo da resposta do erro
    return { success: false, error: error.cause?? error.message };
  }
}

export default processPayment